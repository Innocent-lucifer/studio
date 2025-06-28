
import { NextRequest, NextResponse } from 'next/server';
import { updateUserPlanByEmail } from '@/lib/firebaseUserActions';

// IMPORTANT: This is a simplified webhook handler for demonstration.
// In a production environment, you MUST verify the webhook signature from Paddle
// to ensure the request is legitimate. This typically requires a webhook secret key.
// See Paddle Docs: https://developer.paddle.com/webhooks/signature-verification

// Map your Paddle Price IDs to your app's plan names
const PADDLE_PRICE_IDS = {
  monthly: process.env.NEXT_PUBLIC_PADDLE_SANDBOX_MONTHLY_PRICE_ID,
  yearly: process.env.NEXT_PUBLIC_PADDLE_SANDBOX_YEARLY_PRICE_ID,
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Check for the event type that signifies a successful checkout
    if (body.event_type === 'transaction.completed') {
      const transactionData = body.data;
      const userEmail = transactionData.customer?.email;
      const priceId = transactionData.items?.[0]?.price?.id;

      if (!userEmail || !priceId) {
        console.warn('Webhook missing user email or price ID.', body);
        return NextResponse.json({ message: 'Missing user email or price ID.' }, { status: 400 });
      }

      let newPlan: 'monthly' | 'yearly' | undefined;

      if (priceId === PADDLE_PRICE_IDS.monthly) {
        newPlan = 'monthly';
      } else if (priceId === PADDLE_PRICE_IDS.yearly) {
        newPlan = 'yearly';
      }

      if (newPlan) {
        console.log(`Attempting to update plan for ${userEmail} to ${newPlan}`);
        const success = await updateUserPlanByEmail(userEmail, newPlan);
        if (success) {
          console.log(`Successfully updated plan for ${userEmail}.`);
          return NextResponse.json({ message: 'User plan updated successfully.' }, { status: 200 });
        } else {
          console.error(`Failed to update plan for user: ${userEmail}`);
          return NextResponse.json({ message: 'User not found or failed to update.' }, { status: 404 });
        }
      } else {
         console.warn(`Webhook received for an unknown or unhandled priceId: ${priceId}`);
      }
    }
    
    // Acknowledge other events from Paddle without taking action
    return NextResponse.json({ message: 'Webhook received and acknowledged.' }, { status: 200 });

  } catch (error: any) {
    console.error('Error processing Paddle webhook:', error.message);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
