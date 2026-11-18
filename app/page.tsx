'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Bot, 
  FileText, 
  Globe, 
  ShieldCheck, 
  Zap, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles, 
  Search, 
  Layers, 
  Users, 
  Lock, 
  ChevronDown, 
  Menu, 
  X,
  MessageSquare
} from 'lucide-react';

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: "How does KnowFlow AI keep our company data secure?",
      a: "KnowFlow AI utilizes enterprise-grade encryption at rest and in transit via Supabase PostgreSQL with isolated Row Level Security (RLS) per workspace. Your documents are never used to train public foundation models."
    },
    {
      q: "What file formats can KnowFlow AI process?",
      a: "We support PDF, DOCX, TXT, CSV, and XLSX spreadsheets. You can also import public website URLs to automatically index web documentation."
    },
    {
      q: "Can the AI hallucinate or invent answers?",
      a: "No. Our RAG pipeline strictly forces the assistant to answer using only retrieved company knowledge chunks. If the information is not present in your knowledge base, it explicitly states it cannot find it."
    },
    {
      q: "How are team members managed?",
      a: "Workspaces support role-based access control (Owner, Admin, Member). You can invite colleagues via email and assign appropriate permissions."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white">
      {/* Navigation */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-950/80 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">KnowFlow<span className="text-indigo-400">.ai</span></span>
          </div>

          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-300">
            <a href="#features" className="hover:text-indigo-400 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-indigo-400 transition-colors">How It Works</a>
            <a href="#pricing" className="hover:text-indigo-400 transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-indigo-400 transition-colors">FAQ</a>
          </nav>

          <div className="hidden md:flex items-center space-x-4">
            <Link href="/login" className="text-sm font-medium text-slate-300 hover:text-white px-4 py-2 transition-colors">
              Login
            </Link>
            <Link href="/signup" className="text-sm font-medium bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02]">
              Get Started Free
            </Link>
          </div>

          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
            className="md:hidden text-slate-300 hover:text-white p-2"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-slate-900 border-b border-slate-800 px-6 py-6 space-y-4">
            <a href="#features" onClick={() => setMobileMenuOpen(false)} className="block text-base font-medium text-slate-300 hover:text-white">Features</a>
            <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="block text-base font-medium text-slate-300 hover:text-white">How It Works</a>
            <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="block text-base font-medium text-slate-300 hover:text-white">Pricing</a>
            <a href="#faq" onClick={() => setMobileMenuOpen(false)} className="block text-base font-medium text-slate-300 hover:text-white">FAQ</a>
            <div className="pt-4 border-t border-slate-800 flex flex-col space-y-3">
              <Link href="/login" className="text-center py-2.5 font-medium text-slate-300 hover:text-white">Login</Link>
              <Link href="/signup" className="text-center py-2.5 bg-indigo-600 text-white font-medium rounded-xl shadow-lg">Get Started Free</Link>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(99,102,241,0.15),rgba(255,255,255,0))]"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-indigo-950/80 border border-indigo-500/30 text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-8 shadow-inner">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>Next-Gen Corporate RAG Knowledge Assistant</span>
          </div>
          
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight max-w-4xl mx-auto leading-tight">
            Your Company&apos;s Knowledge. <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-pink-400 bg-clip-text text-transparent">One Intelligent AI.</span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Instantly ingest internal PDFs, manuals, spreadsheets, and websites. Empower your team with an AI assistant that delivers verified answers with exact source citations.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup" className="w-full sm:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-2xl shadow-xl shadow-indigo-600/30 transition-all flex items-center justify-center space-x-2 group">
              <span>Start Building Free</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/login" className="w-full sm:w-auto px-8 py-4 bg-slate-900 hover:bg-slate-800 text-slate-200 font-semibold rounded-2xl border border-slate-800 transition-all flex items-center justify-center">
              Explore Live Demo
            </Link>
          </div>

          {/* Product Dashboard Preview */}
          <div className="mt-16 relative max-w-5xl mx-auto rounded-2xl p-2 bg-gradient-to-b from-slate-800 to-slate-900 shadow-2xl border border-slate-800">
            <div className="bg-slate-950 rounded-xl overflow-hidden border border-slate-800">
              <div className="h-11 bg-slate-900/80 border-b border-slate-800 px-4 flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                <span className="ml-4 text-xs font-mono text-slate-400">app.knowflow.ai/workspace/engineering-kb</span>
              </div>
              <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
                <div className="lg:col-span-1 bg-slate-900/60 p-5 rounded-xl border border-slate-800/80">
                  <div className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">Knowledge Base</div>
                  <div className="text-lg font-bold text-white mt-1">Engineering Manuals</div>
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center space-x-3 p-2.5 rounded-lg bg-slate-800/50 text-sm text-slate-300">
                      <FileText className="w-4 h-4 text-indigo-400" />
                      <span className="truncate">ISO-9001-Compliance.pdf</span>
                    </div>
                    <div className="flex items-center space-x-3 p-2.5 rounded-lg bg-slate-800/50 text-sm text-slate-300">
                      <FileText className="w-4 h-4 text-indigo-400" />
                      <span className="truncate">API-Gateway-Architecture.docx</span>
                    </div>
                    <div className="flex items-center space-x-3 p-2.5 rounded-lg bg-slate-800/50 text-sm text-slate-300">
                      <Globe className="w-4 h-4 text-emerald-400" />
                      <span className="truncate">https://docs.company.com</span>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-2 bg-slate-900/60 p-5 rounded-xl border border-slate-800/80 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center space-x-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      <MessageSquare className="w-4 h-4 text-indigo-400" />
                      <span>AI RAG Assistant</span>
                    </div>
                    <div className="mt-4 p-4 rounded-xl bg-slate-800/40 border border-slate-700/50 text-sm text-slate-200">
                      <p className="font-semibold text-indigo-300 mb-1">User Question:</p>
                      <p>What is our standard protocol for API rate limiting during high traffic surges?</p>
                    </div>
                    <div className="mt-3 p-4 rounded-xl bg-indigo-950/30 border border-indigo-500/20 text-sm text-slate-200">
                      <p className="font-semibold text-indigo-400 mb-1">KnowFlow AI Answer:</p>
                      <p>According to <span className="text-indigo-300 underline font-medium">API-Gateway-Architecture.docx</span> (Page 14), our standard rate limit is set to 1,000 requests per minute per API token with automatic token bucket throttling.</p>
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                    <span>⚡ Generated in 320ms with Gemini + pgvector</span>
                    <span className="text-emerald-400 font-medium">● Verified Citation</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-slate-900/50 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              Engineered for Enterprise Knowledge Management
            </h2>
            <p className="mt-4 text-lg text-slate-400">
              Everything your organization needs to transform scattered documents into an interactive AI oracle.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: FileText,
                title: "Deep Document Intelligence",
                description: "Seamlessly ingest PDF, DOCX, TXT, CSV, and XLSX spreadsheets with automatic chunking and vector embeddings."
              },
              {
                icon: Search,
                title: "Vector Semantic Search",
                description: "Powered by PostgreSQL pgvector and Gemini embeddings for lightning-fast, high-precision retrieval."
              },
              {
                icon: ShieldCheck,
                title: "Strict Source Citations",
                description: "Every answer includes exact document titles and similarity scores so your team can verify every claim instantly."
              },
              {
                icon: Layers,
                title: "Multi-Tenant Workspaces",
                description: "Isolate departments, clients, or business units with secure Row Level Security (RLS) policies."
              },
              {
                icon: Globe,
                title: "Automated Website Import",
                description: "Crawl and index public company documentation websites and help centers with SSRF protection."
              },
              {
                icon: Users,
                title: "Team Collaboration",
                description: "Invite colleagues with granular permissions (Owner, Admin, Member) and shared chat history."
              }
            ].map((feature, i) => (
              <div key={i} className="p-8 rounded-2xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 transition-all hover:shadow-xl hover:shadow-indigo-500/10 group">
                <div className="w-12 h-12 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-6 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              Up and Running in 3 Simple Steps
            </h2>
            <p className="mt-4 text-lg text-slate-400">
              Transform your organization&apos;s workflow in minutes, not weeks.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Create Workspace & Upload",
                description: "Set up your secure workspace and drag-and-drop your company PDFs, manuals, and spreadsheets."
              },
              {
                step: "02",
                title: "Automatic Embedding",
                description: "KnowFlow AI extracts text, splits into optimized chunks, and generates vector embeddings stored in pgvector."
              },
              {
                step: "03",
                title: "Ask & Get Answers",
                description: "Query your knowledge base in natural language and receive precise, cited answers instantly."
              }
            ].map((item, i) => (
              <div key={i} className="relative p-8 rounded-2xl bg-slate-900/60 border border-slate-800">
                <div className="text-5xl font-extrabold text-indigo-500/20 mb-4">{item.step}</div>
                <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-slate-900/50 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              Simple, Transparent Pricing
            </h2>
            <p className="mt-4 text-lg text-slate-400">
              Choose the plan that fits your company&apos;s knowledge volume.
            </p>

            <div className="mt-8 inline-flex items-center p-1.5 rounded-xl bg-slate-900 border border-slate-800">
              <button 
                onClick={() => setBillingCycle('monthly')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${billingCycle === 'monthly' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
              >
                Monthly Billing
              </button>
              <button 
                onClick={() => setBillingCycle('annual')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${billingCycle === 'annual' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
              >
                Annual <span className="text-xs text-emerald-400 ml-1 font-bold">Save 20%</span>
              </button>
            </div>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Starter",
                price: billingCycle === 'annual' ? "₹799" : "₹999",
                period: "/month",
                description: "Ideal for small teams getting started with AI knowledge bases.",
                features: ["1 Workspace", "Up to 50 Documents", "5 Knowledge Bases", "Standard RAG Chat", "Email Support"],
                popular: false
              },
              {
                name: "Pro",
                price: billingCycle === 'annual' ? "₹2,399" : "₹2,999",
                period: "/month",
                description: "Perfect for growing businesses with extensive documentation.",
                features: ["3 Workspaces", "Up to 500 Documents", "Unlimited Knowledge Bases", "Advanced Vector Search", "Priority Support", "Team Invitations"],
                popular: true
              },
              {
                name: "Business",
                price: billingCycle === 'annual' ? "₹6,399" : "₹7,999",
                period: "/month",
                description: "For enterprises requiring maximum security and scale.",
                features: ["Unlimited Workspaces", "Unlimited Documents", "Custom Integrations", "API Access", "Dedicated Account Manager", "SLA Guarantee"],
                popular: false
              }
            ].map((plan, i) => (
              <div key={i} className={`relative p-8 rounded-2xl bg-slate-900 border ${plan.popular ? 'border-indigo-500 shadow-2xl shadow-indigo-500/10' : 'border-slate-800'}`}>
                {plan.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-indigo-600 text-white text-xs font-bold uppercase tracking-wider shadow">
                    Recommended
                  </div>
                )}
                <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                <p className="text-slate-400 text-sm mb-6">{plan.description}</p>
                <div className="flex items-baseline space-x-1 mb-6">
                  <span className="text-4xl font-extrabold text-white">{plan.price}</span>
                  <span className="text-slate-400 text-sm">{plan.period}</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feat, idx) => (
                    <li key={idx} className="flex items-center space-x-3 text-sm text-slate-300">
                      <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/signup" className={`w-full py-3 rounded-xl font-semibold flex items-center justify-center transition-all ${plan.popular ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30' : 'bg-slate-800 hover:bg-slate-700 text-slate-200'}`}>
                  Get Started
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="mt-4 text-lg text-slate-400">
              Got questions? We&apos;ve got answers.
            </p>
          </div>

          <div className="mt-12 space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden">
                <button 
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full px-6 py-5 text-left flex items-center justify-between font-semibold text-white hover:text-indigo-400 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-5 h-5 transition-transform ${openFaq === i ? 'rotate-180 text-indigo-400' : 'text-slate-400'}`} />
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-5 text-slate-400 text-sm leading-relaxed border-t border-slate-800/60 pt-4">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-slate-950 border-t border-slate-800 text-slate-400 text-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold">
              K
            </div>
            <span className="font-bold text-white">KnowFlow AI</span>
          </div>
          <p>© {new Date().getFullYear()} KnowFlow AI Inc. All rights reserved.</p>
          <div className="flex space-x-6">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Security</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
