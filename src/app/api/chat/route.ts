import { NextRequest, NextResponse } from "next/server";

// Simple FAQ responses - can be replaced with OpenAI integration later
const FAQ_RESPONSES: Record<string, string> = {
  pricing: "AgentSurge offers a 7-day free trial, then $99/month for unlimited access to our recruit database and CRM features.",
  trial: "Yes! We offer a 7-day free trial. Your card won't be charged until the trial ends, and you can cancel anytime.",
  recruits: "Our recruits are pre-qualified individuals interested in selling life insurance. We provide both licensed and unlicensed recruits.",
  licensed: "Licensed recruits already have their insurance license and are ready to start selling. They're priced at $35 each.",
  unlicensed: "Unlicensed recruits are interested in getting licensed. They're $25 each and typically have high conversion rates.",
  cancel: "You can cancel your subscription anytime from your account settings. No questions asked!",
  support: "You can reach our support team at support@agentsurge.co or through this chat. We typically respond within 24 hours.",
  crm: "Our CRM helps you track all your recruits in one place. You can see their status, notes, and contact information.",
  disputes: "If you have an issue with a recruit, you can file a dispute from your dashboard. Our team will review it within 48 hours.",
};

function findBestResponse(message: string): string {
  const lowerMessage = message.toLowerCase();

  // Check for keyword matches
  for (const [keyword, response] of Object.entries(FAQ_RESPONSES)) {
    if (lowerMessage.includes(keyword)) {
      return response;
    }
  }

  // Check for common greetings
  if (lowerMessage.match(/^(hi|hello|hey|good morning|good afternoon|good evening)/)) {
    return "Hello! How can I help you today? I can answer questions about pricing, recruits, our trial, or anything else about AgentSurge.";
  }

  // Check for thanks
  if (lowerMessage.match(/(thank|thanks|thx)/)) {
    return "You're welcome! Is there anything else I can help you with?";
  }

  // Check for specific questions
  if (lowerMessage.includes("how") && lowerMessage.includes("work")) {
    return "AgentSurge connects you with pre-qualified recruits interested in life insurance. Simply sign up, browse available recruits, and purchase the ones you want. They'll be added to your CRM instantly!";
  }

  if (lowerMessage.includes("cost") || lowerMessage.includes("price") || lowerMessage.includes("how much")) {
    return FAQ_RESPONSES.pricing;
  }

  if (lowerMessage.includes("free")) {
    return FAQ_RESPONSES.trial;
  }

  // Default response
  return "I'm not sure I understand that question. I can help you with information about pricing, our trial, licensed/unlicensed recruits, the CRM, disputes, or general support. What would you like to know?";
}

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Messages are required" },
        { status: 400 }
      );
    }

    // Get the last user message
    const lastMessage = messages[messages.length - 1];

    if (lastMessage.role !== "user") {
      return NextResponse.json(
        { error: "Last message must be from user" },
        { status: 400 }
      );
    }

    // Generate response
    const response = findBestResponse(lastMessage.content);

    return NextResponse.json({ message: response });
  } catch (error) {
    console.error("Chat error:", error);
    return NextResponse.json(
      { error: "Failed to process message" },
      { status: 500 }
    );
  }
}
