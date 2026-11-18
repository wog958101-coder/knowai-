import { createClient } from '@/lib/supabase/server';

export async function getWorkspaceSubscription(workspaceId: string) {
  const supabase = await createClient();

  const { data: sub, error } = await supabase
    .from('workspace_subscriptions')
    .select('*, plan:subscription_plans(*)')
    .eq('workspace_id', workspaceId)
    .single();

  if (error || !sub) {
    return {
      status: 'inactive',
      planName: 'Starter (Free Tier)',
      active: true, // Allow basic usage by default
      subscription: null,
    };
  }

  const isActive = ['active', 'authenticated', 'resumed'].includes(sub.status);

  return {
    status: sub.status,
    planName: sub.plan?.name || 'Starter',
    active: isActive || sub.status === 'created',
    subscription: sub,
  };
}
