import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-09-30.clover",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("stripe-signature")!;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    switch (event.type) {
      case "checkout.session.completed":
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutSessionCompleted(session);
        break;

      case "customer.subscription.created":
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionCreated(subscription);
        break;

      case "customer.subscription.updated":
        const updatedSubscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(updatedSubscription);
        break;

      case "customer.subscription.deleted":
        const deletedSubscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(deletedSubscription);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}

async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session
) {
  const userId = session.metadata?.userId;
  if (!userId) return;

  // Update user to Pro plan
  await prisma.users.update({
    where: { id: userId },
    data: {
      plan: "Paid",
      usageLimit: 999999, // Unlimited
      stripeCustomerId: session.customer as string,
    },
  });
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.userId;
  if (!userId) return;

  // Update user subscription details
  await prisma.subscriptions.create({
    data: {
      userId,
      stripeSubscriptionId: subscription.id,
      stripeCustomerId: subscription.customer as string,
    },
  });
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.userId;
  if (!userId) return;

  if (subscription.status === "active") {
    // Update user to Pro plan
    await prisma.users.update({
      where: { id: userId },
      data: {
        plan: "Paid",
        usageLimit: 999999, // Unlimited
      },
    });
  } else if (
    subscription.status === "canceled" ||
    subscription.status === "unpaid"
  ) {
    // Downgrade user to Free plan
    await prisma.users.update({
      where: { id: userId },
      data: {
        plan: "Free",
        usageLimit: 20,
      },
    });
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.userId;
  if (!userId) return;

  // Downgrade user to Free plan
  await prisma.users.update({
    where: { id: userId },
    data: {
      plan: "Free",
      usageLimit: 20,
    },
  });

  // Delete subscription record
  await prisma.subscriptions.deleteMany({
    where: {
      stripeSubscriptionId: subscription.id,
    },
  });
}
