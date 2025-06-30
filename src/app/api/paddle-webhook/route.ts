
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { findOrCreateUserForPurchase, updateUserPlanByUID } from '@/lib/firebaseAdminActions';

// These are your LIVE price IDs.
const PADDLE_PRICE_IDS = {
  monthly: "pri_01jyp11r1dqn1gyvk3ybmrsctv",
  yearly: "pri_01jyp1dzgerhxbdx8rbz8pzsts",
};

async function handlePurchaseEvent(eventData: any, eventType: string) {
  console.log(`[Webhook] Handling event: ${eventType}`);
  
  // Robustly parse custom_data
  const rawCustomData = eventData.custom_data;
  let parsedCustomData: { userId?: string } = {};

  if (rawCustomData) {
    if (typeof rawCustomData === 'string') {
      try {
        parsedCustomData = JSON.parse(rawCustomData);
        console.log('[Webhook] Successfully parsed stringified custom_data.');
      } catch (e) {
        console.error('[Webhook] FAILED to parse custom_data string:', rawCustomData, e);
      }
    } else if (typeof rawCustomData === 'object' && rawCustomData !== null) {
      parsedCustomData = rawCustomData;
      console.log('[Webhook] custom_data is already an object.');
    }
  }

  const userId = parsedCustomData?.userId;
  const userEmail = eventData.customer?.email;
  const priceId = eventData.items?.[0]?.price?.id;

  console.log(`[Webhook] Extracted Info: UserID=${userId}, Email=${userEmail}, PriceID=${priceId}`);

  let newPlan: 'monthly' | 'yearly' | undefined;
  if (priceId === PADDLE_PRICE_IDS.monthly) newPlan = 'monthly';
  if (priceId === PADDLE_PRICE_IDS.yearly) newPlan = 'yearly';

  if (!newPlan) {
    console.warn(`[Webhook] Received webhook for an unhandled priceId: ${priceId}. Ignoring.`);
    return NextResponse.json({ message: 'Webhook acknowledged, but price ID is not handled.' }, { status: 200 });
  }

  console.log(`[Webhook] Determined new plan: ${newPlan}`);

  if (userId) {
    console.log(`[Webhook] Processing purchase for UID: ${userId} with plan ${newPlan}.`);
    const { success, message } = await updateUserPlanByUID(userId, newPlan);
    if (success) {
      console.log(`[Webhook] Successfully processed for UID ${userId}: ${message}`);
      return NextResponse.json({ message: 'Webhook processed successfully.' }, { status: 200 });
    } else {
      console.error(`[Webhook] FAILED to process for UID ${userId}: ${message}`);
      return NextResponse.json({ message: `Webhook processing failed: ${message}` }, { status: 500 });
    }
  }

  if (userEmail) {
    console.log(`[Webhook] Processing purchase for Email: ${userEmail} with plan ${newPlan}. (Fallback because no UID was found)`);
    const { success, message } = await findOrCreateUserForPurchase(userEmail, newPlan);
    if (success) {
      console.log(`[Webhook] Successfully processed via email fallback for ${userEmail}: ${message}`);
      return NextResponse.json({ message: 'Webhook processed successfully.' }, { status: 200 });
    } else {
      console.error(`[Webhook] FAILED to process for email ${userEmail}: ${message}`);
      return NextResponse.json({ message: `Webhook processing failed: ${message}` }, { status: 500 });
    }
  }

  console.warn(`[Webhook] Event "${eventType}" is missing both custom userId and customer email. Cannot identify user.`, { eventId: eventData.id });
  return NextResponse.json({ message: 'Webhook acknowledged, but no user identifier found.' }, { status: 200 });
}

export async function POST(req: NextRequest) {
  console.log('[Webhook] Received a POST request.');
  const webhookSecret = process.env.PADDLE_WEBHOOK_SECRET_KEY;

  if (!webhookSecret) {
    console.error("CRITICAL: PADDLE_WEBHOOK_SECRET_KEY is not set in environment variables. Webhook verification is disabled.");
    return NextResponse.json({ message: 'Server configuration error: Webhook secret not found.' }, { status: 500 });
  }
  console.log('[Webhook] Paddle secret key was found in environment variables.');
  
  const rawBody = await req.text();
  const signature = req.headers.get('paddle-signature');

  if (!signature) {
    console.warn('[Webhook] Request received without a signature.');
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
        console.warn('Invalid Paddle webhook signature. Verification failed.');
        return new NextResponse('Invalid signature.', { status: 401 });
    }
    console.log('[Webhook] Signature verification successful.');
  } catch (error: any) {
      console.error('[Webhook] Error during signature verification:', error.message);
      return new NextResponse('Signature verification failed.', { status: 400 });
  }

  try {
    const body = JSON.parse(rawBody);
    console.log('[Webhook] Raw body received:', JSON.stringify(body, null, 2)); // Detailed log of the entire body
    const eventType = body.event_type;
    console.log(`[Webhook] Processing verified event type: ${eventType}`);
    
    if (eventType === 'transaction.completed' || eventType === 'subscription.created') {
      return await handlePurchaseEvent(body.data, eventType);
    }
    
    console.log(`[Webhook] Acknowledging verified but unhandled event type: ${eventType}`);
    return NextResponse.json({ message: 'Webhook received and acknowledged.' }, { status: 200 });

  } catch (error: any) {
    console.error('[Webhook] Error parsing or processing webhook body:', error.message);
    return NextResponse.json({ message: 'Internal Server Error while processing body' }, { status: 500 });
  }
}
