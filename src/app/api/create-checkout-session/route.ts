import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import Stripe from "stripe";
import prisma from "@/lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-09-30.clover",
});

export async function POST(request: NextRequest) {
  try {
    const token = await getToken({ req: request });

    if (!token?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get or create user
    let user = await prisma.users.findUnique({
      where: { email: token.email as string },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      customer_email: user.email,
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID, // Your Stripe price ID for the subscription
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${process.env.NEXTAUTH_URL}/?upgraded=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXTAUTH_URL}/?payment_canceled=true`,
      metadata: {
        userId: user.id,
        email: user.email,
      },
      subscription_data: {
        metadata: {
          userId: user.id,
          email: user.email,
        },
      },
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
