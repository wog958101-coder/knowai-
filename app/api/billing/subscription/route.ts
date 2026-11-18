import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: member } = await supabase
      .from('workspace_members')
      .select('workspace_id')
      .eq('user_id', user.id)
      .single();

    if (!member) return NextResponse.json({ error: 'Workspace not found' }, { status: 400 });

    const [subRes, plansRes, txRes] = await Promise.all([
      supabase.from('workspace_subscriptions').select('*, plan:subscription_plans(*)').eq('workspace_id', member.workspace_id).single(),
      supabase.from('subscription_plans').select('*'),
      supabase.from('payment_transactions').select('*').eq('workspace_id', member.workspace_id).order('created_at', { ascending: false }),
    ]);

    return NextResponse.json({
      subscription: subRes.data || null,
      plans: plansRes.data || [],
      transactions: txRes.data || [],
    });
  } catch (err: any) {
    console.error('Get subscription error:', err);
    return NextResponse.json({ error: err.message || 'Failed to get subscription' }, { status: 500 });
  }
}
