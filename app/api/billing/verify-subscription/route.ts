import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { razorpay_payment_id, razorpay_subscription_id, razorpay_signature } = await req.json();

    if (!razorpay_payment_id || !razorpay_subscription_id || !razorpay_signature) {
      return NextResponse.json({ error: 'Missing payment verification parameters' }, { status: 400 });
    }

    // Verify signature: HMAC-SHA256 of razorpay_payment_id + "|" + razorpay_subscription_id
    const keySecret = process.env.RAZORPAY_KEY_SECRET || 'placeholder_secret';
    const generatedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(`${razorpay_payment_id}|${razorpay_subscription_id}`)
      .digest('hex');

    if (generatedSignature !== razorpay_signature) {
      return NextResponse.json({ error: 'Invalid payment signature verification' }, { status: 400 });
    }

    const { data: member } = await supabase
      .from('workspace_members')
      .select('workspace_id')
      .eq('user_id', user.id)
      .single();

    if (!member) return NextResponse.json({ error: 'Workspace not found' }, { status: 400 });
    const workspaceId = member.workspace_id;

    // Update subscription to active
    await supabase
      .from('workspace_subscriptions')
      .update({
        status: 'active',
        current_period_start: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('workspace_id', workspaceId)
      .eq('razorpay_subscription_id', razorpay_subscription_id);

    // Record payment transaction
    await supabase.from('payment_transactions').insert({
      workspace_id: workspaceId,
      razorpay_payment_id,
      amount: 99900, // or fetched from sub
      currency: 'INR',
      status: 'captured',
      method: 'razorpay',
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Verify subscription error:', err);
    return NextResponse.json({ error: err.message || 'Failed to verify subscription' }, { status: 500 });
  }
}
