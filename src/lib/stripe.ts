import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-12-15.clover",
});

export const TRIAL_DAYS = 7;
export const MONTHLY_PRICE_CENTS = 9900; // $99/month after trial
