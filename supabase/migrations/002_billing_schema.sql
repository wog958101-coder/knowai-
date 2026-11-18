-- KnowFlow AI Razorpay Billing Schema & Subscriptions

-- Subscription Plans table
create table if not exists public.subscription_plans (
  id uuid default gen_random_uuid() primary key,
  name text not null unique,
  razorpay_plan_id text not null unique,
  amount integer not null, -- in paise
  currency text default 'INR' not null,
  interval text default 'monthly' not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Workspace Subscriptions table
create table if not exists public.workspace_subscriptions (
  id uuid default gen_random_uuid() primary key,
  workspace_id uuid references public.workspaces on delete cascade not null unique,
  plan_id uuid references public.subscription_plans on delete restrict not null,
  razorpay_subscription_id text not null unique,
  status text check (status in ('created', 'authenticated', 'active', 'pending', 'halted', 'cancelled', 'paused', 'resumed', 'expired')) default 'created' not null,
  current_period_start timestamp with time zone,
  current_period_end timestamp with time zone,
  cancelled_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Payment Transactions table
create table if not exists public.payment_transactions (
  id uuid default gen_random_uuid() primary key,
  workspace_id uuid references public.workspaces on delete cascade not null,
  subscription_id uuid references public.workspace_subscriptions on delete set null,
  razorpay_payment_id text not null unique,
  razorpay_order_id text,
  amount integer not null,
  currency text default 'INR' not null,
  status text not null,
  method text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Razorpay Webhook Events table for idempotency & duplicate detection
create table if not exists public.razorpay_webhook_events (
  id uuid default gen_random_uuid() primary key,
  event_id text not null unique,
  event_type text not null,
  payload jsonb not null,
  processed_at timestamp with time zone default timezone('utc'::text, now()) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.subscription_plans enable row level security;
alter table public.workspace_subscriptions enable row level security;
alter table public.payment_transactions enable row level security;
alter table public.razorpay_webhook_events enable row level security;

-- RLS Policies
create policy "Anyone can view subscription plans" on public.subscription_plans for select using (true);

create policy "Workspace members can view workspace subscription" on public.workspace_subscriptions for select
  using (public.is_workspace_member(workspace_id, auth.uid()));

create policy "Workspace members can view payment transactions" on public.payment_transactions for select
  using (public.is_workspace_member(workspace_id, auth.uid()));

-- Insert initial subscription plans (Razorpay test plan IDs can be updated via env or auto-created)
insert into public.subscription_plans (name, razorpay_plan_id, amount, currency, interval)
values
  ('Starter', 'plan_starter_999', 99900, 'INR', 'monthly'),
  ('Pro', 'plan_pro_2999', 299900, 'INR', 'monthly'),
  ('Business', 'plan_business_7999', 799900, 'INR', 'monthly')
on conflict (name) do nothing;
