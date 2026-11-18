import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { razorpay } from '@/lib/billing/razorpay';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { planId } = await req.json();
    if (!planId) return NextResponse.json({ error: 'Plan ID is required' }, { status: 400 });

    const { data: member } = await supabase
      .from('workspace_members')
      .select('workspace_id, role')
      .eq('user_id', user.id)
      .single();

    if (!member || !['owner', 'admin'].includes(member.role)) {
      return NextResponse.json({ error: 'Only workspace owners or admins can manage billing' }, { status: 403 });
    }

    const workspaceId = member.workspace_id;

    // Get plan details from database
    const { data: plan, error: planError } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('id', planId)
      .single();

    if (planError || !plan) {
      return NextResponse.json({ error: 'Invalid subscription plan' }, { status: 400 });
    }

    // Create or get Razorpay plan ID (for test mode, ensure plan exists on Razorpay or use test plan id)
    let razorpayPlanId = plan.razorpay_plan_id;
    
    try {
      // Check if plan exists on Razorpay or create one
      await razorpay.plans.fetch(razorpayPlanId);
    } catch {
      // Create Razorpay plan if not exists
      const rzpPlan = await razorpay.plans.create({
        period: 'monthly',
        interval: 1,
        item: {
          name: plan.name,
          amount: plan.amount,
          currency: plan.currency,
          description: `KnowFlow AI ${plan.name} Monthly Subscription`,
        },
      });
      razorpayPlanId = rzpPlan.id;
    }

    // Create Razorpay Subscription
    const rzpSubscription = await razorpay.subscriptions.create({
      plan_id: razorpayPlanId,
      customer_notify: 1,
      total_count: 12, // 1 year recurring test
      notes: {
        workspace_id: workspaceId,
        user_email: user.email || '',
      },
    });

    // Save initial subscription record in database with 'created' status
    await supabase.from('workspace_subscriptions').upsert({
      workspace_id: workspaceId,
      plan_id: plan.id,
      razorpay_subscription_id: rzpSubscription.id,
      status: 'created',
    }, { onConflict: 'workspace_id' });

    return NextResponse.json({
      subscriptionId: rzpSubscription.id,
      keyId: process.env.RAZORPAY_KEY_ID,
      planName: plan.name,
      amount: plan.amount,
      currency: plan.currency,
    });
  } catch (err: any) {
    console.error('Create subscription error:', err);
    return NextResponse.json({ error: err.message || 'Failed to create subscription' }, { status: 500 });
  }
}
