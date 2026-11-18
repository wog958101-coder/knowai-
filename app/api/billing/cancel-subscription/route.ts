import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { razorpay } from '@/lib/billing/razorpay';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: member } = await supabase
      .from('workspace_members')
      .select('workspace_id, role')
      .eq('user_id', user.id)
      .single();

    if (!member || !['owner', 'admin'].includes(member.role)) {
      return NextResponse.json({ error: 'Only workspace owners or admins can cancel billing' }, { status: 403 });
    }

    const { data: sub } = await supabase
      .from('workspace_subscriptions')
      .select('*')
      .eq('workspace_id', member.workspace_id)
      .single();

    if (!sub || !sub.razorpay_subscription_id) {
      return NextResponse.json({ error: 'No active subscription found' }, { status: 404 });
    }

    // Cancel on Razorpay
    await razorpay.subscriptions.cancel(sub.razorpay_subscription_id);

    // Update in database
    await supabase
      .from('workspace_subscriptions')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('workspace_id', member.workspace_id);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Cancel subscription error:', err);
    return NextResponse.json({ error: err.message || 'Failed to cancel subscription' }, { status: 500 });
  }
}
