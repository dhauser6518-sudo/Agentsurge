import { DefaultSession } from "next-auth";
import { DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      emailVerified: boolean;
      subscriptionStatus: string;
      trialEndsAt: string | null;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }

  interface User {
    id: string;
    role: string;
    emailVerified: boolean;
    subscriptionStatus: string;
    trialEndsAt: string | null;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string;
    role: string;
    emailVerified: boolean;
    subscriptionStatus: string;
    trialEndsAt: string | null;
  }
}
