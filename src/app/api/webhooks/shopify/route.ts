import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { generateTempPassword } from "@/lib/utils";
import { sendWelcomeEmail } from "@/lib/email";

const SHOPIFY_WEBHOOK_SECRET = process.env.SHOPIFY_WEBHOOK_SECRET || "";

// Shopify Order types
interface ShopifyCustomer {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
}

interface ShopifyLineItem {
  id: number;
  title: string;
  quantity: number;
  sku: string;
  product_id: number;
  variant_id: number;
  price: string;
}

interface ShopifyOrder {
  id: number;
  order_number: number;
  email: string;
  customer: ShopifyCustomer;
  line_items: ShopifyLineItem[];
  total_price: string;
  financial_status: string;
  fulfillment_status: string | null;
  created_at: string;
  note?: string;
  note_attributes?: Array<{ name: string; value: string }>;
}

// Verify Shopify webhook signature
function verifyShopifyWebhook(body: string, signature: string): boolean {
  if (!SHOPIFY_WEBHOOK_SECRET) {
    console.error("SHOPIFY_WEBHOOK_SECRET not configured");
    return false;
  }

  const hmac = crypto
    .createHmac("sha256", SHOPIFY_WEBHOOK_SECRET)
    .update(body, "utf8")
    .digest("base64");

  return crypto.timingSafeEqual(Buffer.from(hmac), Buffer.from(signature));
}

// POST /api/webhooks/shopify - Handle Shopify webhooks
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("x-shopify-hmac-sha256");
    const topic = request.headers.get("x-shopify-topic");

    if (!signature) {
      return NextResponse.json(
        { error: "Missing x-shopify-hmac-sha256 header" },
        { status: 400 }
      );
    }

    // Verify webhook signature
    if (!verifyShopifyWebhook(body, signature)) {
      console.error("Shopify webhook signature verification failed");
      return NextResponse.json(
        { error: "Webhook signature verification failed" },
        { status: 401 }
      );
    }

    const payload = JSON.parse(body);

    // Handle different webhook topics
    switch (topic) {
      case "orders/paid":
      case "orders/create":
        await handleOrderPaid(payload as ShopifyOrder);
        break;
      default:
        console.log(`Unhandled Shopify webhook topic: ${topic}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Shopify webhook error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}

async function handleOrderPaid(order: ShopifyOrder) {
  const customerEmail = order.customer?.email || order.email;
  const customerFirstName = order.customer?.first_name || "";
  const customerLastName = order.customer?.last_name || "";

  if (!customerEmail) {
    console.error("No customer email in Shopify order:", order.id);
    return;
  }

  // Calculate total quantity of recruits from all line items
  const totalQuantity = order.line_items.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  // Find or create agent account
  let agent = await prisma.user.findUnique({
    where: { email: customerEmail.toLowerCase() },
  });

  let tempPassword: string | null = null;
  let isNewAgent = false;

  if (!agent) {
    tempPassword = generateTempPassword();
    const passwordHash = await bcrypt.hash(tempPassword, 10);

    agent = await prisma.user.create({
      data: {
        email: customerEmail.toLowerCase(),
        passwordHash,
        role: "agent",
        firstName: customerFirstName || null,
        lastName: customerLastName || null,
      },
    });

    isNewAgent = true;
    console.log(`Created new agent from Shopify order: ${customerEmail}`);
  }

  // Check if this order already exists (prevent duplicates)
  const existingOrder = await prisma.order.findFirst({
    where: { shopifyOrderId: order.id.toString() },
  });

  if (existingOrder) {
    console.log(`Shopify order ${order.id} already processed, skipping`);
    return;
  }

  // Create order record
  const amountCents = Math.round(parseFloat(order.total_price) * 100);

  await prisma.order.create({
    data: {
      agentId: agent.id,
      shopifyOrderId: order.id.toString(),
      amountCents,
      quantity: totalQuantity,
      status: "completed",
      metadata: JSON.stringify({
        orderNumber: order.order_number,
        customerEmail: customerEmail,
        financialStatus: order.financial_status,
        lineItems: order.line_items.map((item) => ({
          title: item.title,
          quantity: item.quantity,
          sku: item.sku,
        })),
      }),
    },
  });

  console.log(
    `Shopify order ${order.order_number} created for agent ${customerEmail}: ${totalQuantity} recruits`
  );

  // Send welcome email to new agents
  if (isNewAgent && tempPassword) {
    try {
      await sendWelcomeEmail({
        email: customerEmail,
        firstName: customerFirstName,
        tempPassword,
        recruitCount: totalQuantity,
      });
      console.log(`Welcome email sent to ${customerEmail}`);
    } catch (emailError) {
      console.error(`Failed to send welcome email to ${customerEmail}:`, emailError);
      // Don't fail the webhook - the account is created, just log the email failure
    }
  }
}
