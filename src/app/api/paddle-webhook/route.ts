
import { NextRequest, NextResponse } from 'next/server';
import { findOrCreateUserForPurchase } from '@/lib/firebaseAdminActions';

// IMPORTANT: This is a simplified webhook handler for demonstration.
// In a production environment, you MUST verify the webhook signature from Paddle.
// Use the exact same price IDs here as on the frontend to ensure sync.
const PADDLE_PRICE_IDS = {
  monthly: process.env.NEXT_PUBLIC_PADDLE_SANDBOX_MONTHLY_PRICE_ID || "pri_01jytrrggq73bfpd9bce3resb0",
  yearly: process.env.NEXT_PUBLIC_PADDLE_SANDBOX_YEARLY_PRICE_ID || "pri_01jytrs4wqac0a8pnyttzz34w1",
};


/**
 * This function processes a Paddle webhook event to update a user's plan.
 * It's designed to be called from the main POST handler.
 */
async function handlePurchaseEvent(eventData: any, eventType: string) {
  // For new checkouts, Paddle includes a `customer` object with an email.
  // For other events, it might only be a `customer_id`. We need the email to proceed.
  const userEmail = eventData.customer?.email;
  const priceId = eventData.items?.[0]?.price?.id;

  // If we don't have an email or a price ID, we can't process this purchase.
  if (!userEmail || !priceId) {
    console.warn(`Webhook event "${eventType}" is missing customer email or price ID. Skipping.`, {
      eventId: eventData.id,
      emailExists: !!userEmail,
      priceIdExists: !!priceId,
    });
    // We return a 200 OK to tell Paddle not to retry sending this webhook.
    return NextResponse.json({ message: 'Webhook acknowledged, but no action taken due to missing data.' }, { status: 200 });
  }

  let newPlan: 'monthly' | 'yearly' | undefined;
  if (priceId === PADDLE_PRICE_IDS.monthly) {
    newPlan = 'monthly';
  } else if (priceId === PADDLE_PRICE_IDS.yearly) {
    newPlan = 'yearly';
  }

  if (newPlan) {
    console.log(`Processing purchase for ${userEmail} with plan ${newPlan}. Event ID: ${eventData.id}`);
    const { success, message } = await findOrCreateUserForPurchase(userEmail, newPlan);
    if (success) {
      console.log(`Webhook processed successfully: ${message}`);
      return NextResponse.json({ message: 'Webhook processed successfully.' }, { status: 200 });
    } else {
      console.error(`Webhook processing failed: ${message}`);
      // Return a 500 error to signal a server-side failure.
      return NextResponse.json({ message: `Webhook processing failed: ${message}` }, { status: 500 });
    }
  } else {
    // This happens if the price ID from Paddle doesn't match our known plans.
    console.warn(`Webhook received for an unhandled priceId: ${priceId}.`);
    return NextResponse.json({ message: 'Webhook acknowledged, but price ID is not handled.' }, { status: 200 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const eventType = body.event_type;

    // Handle both transaction and subscription creation events as potential triggers for user plan updates.
    // The `transaction.completed` event is the most reliable for new sign-ups.
    if (eventType === 'transaction.completed' || eventType === 'subscription.created') {
      return await handlePurchaseEvent(body.data, eventType);
    }

    // Acknowledge all other events from Paddle without taking action
    console.log(`Acknowledging unhandled event type: ${eventType}`);
    return NextResponse.json({ message: 'Webhook received and acknowledged.' }, { status: 200 });

  } catch (error: any) {
    console.error('Error processing Paddle webhook:', error.message);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
