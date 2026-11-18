'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { CreditCard, CheckCircle2, AlertCircle, Loader2, Sparkles, Shield, ArrowUpRight } from 'lucide-react';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function BillingPage() {
  const [subscriptionData, setSubscriptionData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processingPlanId, setProcessingPlanId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const supabase = createClient();

  const loadBilling = useCallback(async () => {
    try {
      const res = await fetch('/api/billing/subscription');
      const data = await res.json();
      if (res.ok) {
        setSubscriptionData(data);
      }
    } catch (err) {
      console.error('Error loading billing data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadBilling();

    // Load Razorpay checkout script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      script.remove();
    };
  }, [loadBilling]);

  const handleSubscribe = async (planId: string, planName: string) => {
    setProcessingPlanId(planId);
    setError(null);
    setSuccessMessage(null);

    try {
      const res = await fetch('/api/billing/create-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to initialize subscription');

      const options = {
        key: data.keyId || 'rzp_test_placeholder',
        subscription_id: data.subscriptionId,
        name: 'KnowFlow AI',
        description: `${planName} Monthly Plan`,
        image: 'https://knowflow.ai/logo.png',
        handler: async function (response: any) {
          try {
            const verifyRes = await fetch('/api/billing/verify-subscription', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_subscription_id: response.razorpay_subscription_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyRes.json();
            if (!verifyRes.ok) throw new Error(verifyData.error || 'Payment verification failed');

            setSuccessMessage(`Successfully subscribed to ${planName}!`);
            loadBilling();
          } catch (verifyErr: any) {
            setError(verifyErr.message || 'Payment verification failed on server');
          }
        },
        prefill: {
          name: 'Workspace Owner',
          email: 'owner@company.com',
        },
        theme: {
          color: '#6366f1',
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err: any) {
      setError(err.message || 'Failed to start checkout');
    } finally {
      setProcessingPlanId(null);
    }
  };

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel your subscription?')) return;
    setError(null);

    try {
      const res = await fetch('/api/billing/cancel-subscription', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to cancel subscription');

      setSuccessMessage('Subscription cancelled successfully.');
      loadBilling();
    } catch (err: any) {
      setError(err.message || 'Failed to cancel subscription');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  const currentSub = subscriptionData?.subscription;
  const plans = subscriptionData?.plans || [];
  const transactions = subscriptionData?.transactions || [];

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-semibold mb-3 border border-amber-500/20">
          <Shield className="w-3.5 h-3.5" />
          <span>Razorpay Test Mode Active</span>
        </div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Billing & Subscription</h1>
        <p className="mt-1 text-slate-400 text-sm">
          Manage your company subscription plan, billing cycle, and secure payment transactions.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-950/50 border border-red-500/30 flex items-center space-x-3 text-red-300 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-950/50 border border-emerald-500/30 flex items-center space-x-3 text-emerald-300 text-sm">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Current Subscription Card */}
      <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Current Plan</div>
              <div className="text-2xl font-bold text-white mt-0.5">
                {currentSub?.plan?.name || 'Starter (Free Tier)'}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${currentSub?.status === 'active' ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/30' : 'bg-slate-800 text-slate-300'}`}>
              {currentSub?.status || 'inactive'}
            </span>
            {currentSub && currentSub.status === 'active' && (
              <button
                onClick={handleCancel}
                className="px-4 py-2 bg-red-950/40 hover:bg-red-950/80 text-red-300 border border-red-500/30 rounded-xl text-xs font-semibold transition-all"
              >
                Cancel Subscription
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Available Plans */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white tracking-tight">Available Subscription Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan: any) => {
            const isCurrent = currentSub?.plan_id === plan.id && currentSub?.status === 'active';
            return (
              <div key={plan.id} className={`p-6 rounded-2xl bg-slate-900 border flex flex-col justify-between ${isCurrent ? 'border-indigo-500 shadow-xl shadow-indigo-500/10' : 'border-slate-800'}`}>
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                    {isCurrent && (
                      <span className="px-2.5 py-0.5 rounded-full bg-indigo-600 text-white text-[10px] font-bold uppercase tracking-wider">
                        Active
                      </span>
                    )}
                  </div>
                  <div className="flex items-baseline space-x-1 mb-4">
                    <span className="text-3xl font-extrabold text-white">₹{(plan.amount / 100).toLocaleString('en-IN')}</span>
                    <span className="text-slate-400 text-xs">/month</span>
                  </div>
                  <p className="text-slate-400 text-xs mb-6">
                    {plan.name === 'Starter' && 'Ideal for small teams getting started with AI knowledge bases.'}
                    {plan.name === 'Pro' && 'Perfect for growing businesses with extensive documentation.'}
                    {plan.name === 'Business' && 'For enterprises requiring maximum security and scale.'}
                  </p>
                </div>

                <button
                  onClick={() => handleSubscribe(plan.id, plan.name)}
                  disabled={isCurrent || processingPlanId === plan.id}
                  className={`w-full py-3 rounded-xl font-semibold text-xs transition-all flex items-center justify-center space-x-2 ${isCurrent ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30'}`}
                >
                  {processingPlanId === plan.id && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{isCurrent ? 'Current Plan' : `Subscribe to ${plan.name}`}</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Payment History */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white tracking-tight">Payment Transactions</h2>
        <div className="bg-slate-900 rounded-2xl border border-slate-800 divide-y divide-slate-800 overflow-hidden">
          {transactions.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">No payment transactions recorded yet.</div>
          ) : (
            transactions.map((tx: any) => (
              <div key={tx.id} className="p-5 flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-white font-mono">{tx.razorpay_payment_id}</div>
                  <div className="text-xs text-slate-400">{new Date(tx.created_at).toLocaleString()}</div>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-bold text-white">₹{(tx.amount / 100).toLocaleString('en-IN')}</span>
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-emerald-950/80 text-emerald-300 border border-emerald-500/30">
                    {tx.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
