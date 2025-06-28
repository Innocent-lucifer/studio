
import { NextRequest, NextResponse } from 'next/server';
import { findOrCreateUserForPurchase, updateUserPlanByUID } from '@/lib/firebaseAdminActions';

// Hardcode the correct sandbox Price IDs to ensure a match.
const PADDLE_PRICE_IDS = {
  monthly: "pri_01jytrrggq73bfpd9bce3resb0",
  yearly: "pri_01jytrs4wqac0a8pnyttzz34w1",
};

async function handlePurchaseEvent(eventData: any, eventType: string) {
  // 1. Get identifiers from the webhook payload. Paddle sends `custom_data`.
  const userId = eventData.custom_data?.userId;
  const userEmail = eventData.customer?.email; // Fallback
  const priceId = eventData.items?.[0]?.price?.id;

  // 2. Determine the plan from the price ID
  let newPlan: 'monthly' | 'yearly' | undefined;
  if (priceId === PADDLE_PRICE_IDS.monthly) {
    newPlan = 'monthly';
  } else if (priceId === PADDLE_PRICE_IDS.yearly) {
    newPlan = 'yearly';
  }

  if (!newPlan) {
    console.warn(`Webhook received for an unhandled priceId: ${priceId}. Ignoring.`);
    return NextResponse.json({ message: 'Webhook acknowledged, but price ID is not handled.' }, { status: 200 });
  }

  // 3. Update user data - PRIORITIZE UID for reliability
  if (userId) {
    console.log(`Processing purchase for UID: ${userId} with plan ${newPlan}.`);
    const { success, message } = await updateUserPlanByUID(userId, newPlan);
    if (success) {
      console.log(`Webhook processed successfully: ${message}`);
      return NextResponse.json({ message: 'Webhook processed successfully.' }, { status: 200 });
    } else {
      console.error(`Webhook processing failed for UID ${userId}: ${message}`);
      return NextResponse.json({ message: `Webhook processing failed: ${message}` }, { status: 500 });
    }
  }

  // 4. Fallback to email if UID is not present (e.g., for older checkouts or different flows)
  if (userEmail) {
    console.log(`Processing purchase for Email: ${userEmail} with plan ${newPlan}. (Fallback)`);
    const { success, message } = await findOrCreateUserForPurchase(userEmail, newPlan);
     if (success) {
      console.log(`Webhook processed successfully via email fallback: ${message}`);
      return NextResponse.json({ message: 'Webhook processed successfully.' }, { status: 200 });
    } else {
      console.error(`Webhook processing failed for email ${userEmail}: ${message}`);
      return NextResponse.json({ message: `Webhook processing failed: ${message}` }, { status: 500 });
    }
  }

  // 5. If neither UID nor email is available, we cannot process the event.
  console.warn(`Webhook event "${eventType}" is missing both custom userId and customer email. Skipping.`, {
      eventId: eventData.id,
  });
  return NextResponse.json({ message: 'Webhook acknowledged, but no user identifier found.' }, { status: 200 });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const eventType = body.event_type;
    console.log(`Received Paddle webhook: ${eventType}`);

    if (eventType === 'transaction.completed' || eventType === 'subscription.created') {
      if(body.data?.custom_data) {
        console.log("Webhook contains custom_data:", body.data.custom_data);
      }
      return await handlePurchaseEvent(body.data, eventType);
    }
    
    console.log(`Acknowledging unhandled event type: ${eventType}`);
    return NextResponse.json({ message: 'Webhook received and acknowledged.' }, { status: 200 });

  } catch (error: any) {
    console.error('Error processing Paddle webhook:', error.message);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
