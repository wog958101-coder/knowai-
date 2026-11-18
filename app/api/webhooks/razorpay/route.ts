import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-razorpay-signature');
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || 'placeholder_webhook_secret';

    if (!signature) {
      return NextResponse.json({ error: 'Missing Razorpay signature' }, { status: 400 });
    }

    // Verify signature using HMAC-SHA256 on raw body
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(rawBody)
      .digest('hex');

    if (expectedSignature !== signature) {
      console.warn('Invalid Razorpay webhook signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const event = JSON.parse(rawBody);
    const eventId = event.payload?.subscription?.entity?.id || event.event_id || event.created_at?.toString();
    const eventType = event.event;

    const supabase = await createClient();

    // Idempotency check
    if (eventId) {
      const { data: existingEvent } = await supabase
        .from('razorpay_webhook_events')
        .select('id')
        .eq('event_id', eventId)
        .single();

      if (existingEvent) {
        return NextResponse.json({ received: true, duplicate: true });
      }

      await supabase.from('razorpay_webhook_events').insert({
        event_id: eventId,
        event_type: eventType,
        payload: event,
      });
    }

    const subscriptionEntity = event.payload?.subscription?.entity;
    if (subscriptionEntity) {
      const rzpSubId = subscriptionEntity.id;
      const status = subscriptionEntity.status; // active, halted, cancelled, completed, authenticated

      await supabase
        .from('workspace_subscriptions')
        .update({
          status,
          updated_at: new Date().toISOString(),
        })
        .eq('razorpay_subscription_id', rzpSubId);
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error('Razorpay webhook error:', err);
    return NextResponse.json({ error: err.message || 'Webhook processing failed' }, { status: 500 });
  }
}
