
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { findOrCreateUserForPurchase, updateUserPlanByUID } from '@/lib/firebaseAdminActions';

// These are the correct sandbox Price IDs you provided.
const PADDLE_PRICE_IDS = {
  monthly: "pri_01jytrrggq73bfpd9bce3resb0",
  yearly: "pri_01jytrs4wqac0a8pnyttzz34w1",
};

async function handlePurchaseEvent(eventData: any, eventType: string) {
  const userId = eventData.custom_data?.userId;
  const userEmail = eventData.customer?.email;
  const priceId = eventData.items?.[0]?.price?.id;

  let newPlan: 'monthly' | 'yearly' | undefined;
  if (priceId === PADDLE_PRICE_IDS.monthly) newPlan = 'monthly';
  if (priceId === PADDLE_PRICE_IDS.yearly) newPlan = 'yearly';

  if (!newPlan) {
    console.warn(`Webhook received for unhandled priceId: ${priceId}. Ignoring.`);
    return NextResponse.json({ message: 'Webhook acknowledged, but price ID is not handled.' }, { status: 200 });
  }

  if (userId) {
    console.log(`Processing verified purchase for UID: ${userId} with plan ${newPlan}.`);
    const { success, message } = await updateUserPlanByUID(userId, newPlan);
    if (success) {
      console.log(`Webhook processed successfully for UID ${userId}: ${message}`);
      return NextResponse.json({ message: 'Webhook processed successfully.' }, { status: 200 });
    } else {
      console.error(`Webhook processing failed for UID ${userId}: ${message}`);
      return NextResponse.json({ message: `Webhook processing failed: ${message}` }, { status: 500 });
    }
  }

  if (userEmail) {
    console.log(`Processing verified purchase for Email: ${userEmail} with plan ${newPlan}. (Fallback)`);
    const { success, message } = await findOrCreateUserForPurchase(userEmail, newPlan);
    if (success) {
      console.log(`Webhook processed successfully via email fallback for ${userEmail}: ${message}`);
      return NextResponse.json({ message: 'Webhook processed successfully.' }, { status: 200 });
    } else {
      console.error(`Webhook processing failed for email ${userEmail}: ${message}`);
      return NextResponse.json({ message: `Webhook processing failed: ${message}` }, { status: 500 });
    }
  }

  console.warn(`Webhook event "${eventType}" is missing both custom userId and customer email.`, { eventId: eventData.id });
  return NextResponse.json({ message: 'Webhook acknowledged, but no user identifier found.' }, { status: 200 });
}

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.PADDLE_WEBHOOK_SECRET_KEY;

  if (!webhookSecret) {
    console.error("CRITICAL: PADDLE_WEBHOOK_SECRET_KEY is not set in .env file. Webhook verification is disabled.");
    return NextResponse.json({ message: 'Webhook secret not configured.' }, { status: 500 });
  }
  
  // Get raw body for signature verification
  const rawBody = await req.text();
  const signature = req.headers.get('paddle-signature');

  if (!signature) {
    console.warn('Webhook received without a signature.');
    return new NextResponse('Signature missing', { status: 400 });
  }

  try {
    const signatureParts = signature.split(';').map(part => part.split('='));
    const signatureData = Object.fromEntries(signatureParts);
    
    const timestamp = signatureData.ts;
    const hmacSignature = signatureData.h1;

    if (!timestamp || !hmacSignature) {
        throw new Error('Invalid signature format.');
    }

    const signedPayload = `${timestamp}:${rawBody}`;

    const hmac = crypto.createHmac('sha256', webhookSecret);
    hmac.update(signedPayload);
    const computedSignature = hmac.digest('hex');

    if (computedSignature !== hmacSignature) {
        console.warn('Invalid Paddle webhook signature.');
        return new NextResponse('Invalid signature.', { status: 401 });
    }
  } catch (error: any) {
      console.error('Error during webhook signature verification:', error.message);
      return new NextResponse('Signature verification failed.', { status: 400 });
  }

  // Verification successful, now process the event
  try {
    const body = JSON.parse(rawBody);
    const eventType = body.event_type;
    console.log(`Received verified Paddle webhook: ${eventType}`);
    
    if (eventType === 'transaction.completed' || eventType === 'subscription.created') {
      return await handlePurchaseEvent(body.data, eventType);
    }
    
    console.log(`Acknowledging verified but unhandled event type: ${eventType}`);
    return NextResponse.json({ message: 'Webhook received and acknowledged.' }, { status: 200 });

  } catch (error: any) {
    console.error('Error processing verified Paddle webhook:', error.message);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
