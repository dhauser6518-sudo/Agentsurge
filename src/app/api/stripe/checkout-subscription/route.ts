import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-04-30.basil",
});

export async function POST() {
  try {
    const priceId = process.env.STRIPE_SUBSCRIPTION_PRICE_ID;

    if (!priceId) {
      console.error("STRIPE_SUBSCRIPTION_PRICE_ID not configured");
      return NextResponse.json(
        { error: "Subscription not configured" },
        { status: 500 }
      );
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.AUTH_URL}/subscription-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.AUTH_URL}/`,
      subscription_data: {
        metadata: {
          source: "landing_page",
        },
      },
      payment_intent_data: {
        setup_future_usage: "off_session",
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
