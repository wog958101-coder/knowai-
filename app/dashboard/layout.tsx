'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { 
  Bot, 
  LayoutDashboard, 
  Layers, 
  FileText, 
  MessageSquare, 
  BarChart3, 
  Users, 
  Key, 
  Settings, 
  LogOut, 
  ChevronDown, 
  Plus,
  Menu,
  X
} from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<any>(null);
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [currentWorkspace, setCurrentWorkspace] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    async function loadUserData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      setUser(user);

      // Load workspaces
      const { data: memberData } = await supabase
        .from('workspace_members')
        .select('workspace:workspaces(*)')
        .eq('user_id', user.id);

      if (memberData && memberData.length > 0) {
        const wsList = memberData.map((m: any) => m.workspace).filter(Boolean);
        setWorkspaces(wsList);
        setCurrentWorkspace(wsList[0]);
      }
    }

    loadUserData();
  }, [router, supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  const navItems = [
    { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Knowledge Bases', href: '/dashboard/knowledge-bases', icon: Layers },
    { name: 'Documents', href: '/dashboard/documents', icon: FileText },
    { name: 'AI Assistant', href: '/dashboard/chat', icon: MessageSquare },
    { name: 'Chat History', href: '/dashboard/chat-history', icon: MessageSquare },
    { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
    { name: 'Team Members', href: '/dashboard/team', icon: Users },
    { name: 'API & Integrations', href: '/dashboard/api-keys', icon: Key },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans selection:bg-indigo-500 selection:text-white">
      {/* Sidebar for Desktop */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800 flex flex-col transition-transform duration-300 md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-20 px-6 border-b border-slate-800 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-white tracking-tight">KnowFlow<span className="text-indigo-400">.ai</span></span>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Workspace Dropdown */}
        <div className="p-4 border-b border-slate-800">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Workspace</div>
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div className="truncate">
              <div className="font-semibold text-sm text-white truncate">{currentWorkspace?.name || 'Loading...'}</div>
              <div className="text-xs text-slate-400 truncate">@{currentWorkspace?.slug || 'workspace'}</div>
            </div>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-4 py-4 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center space-x-3 px-3.5 py-3 rounded-xl text-sm font-medium transition-all ${isActive ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'}`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Profile & Sign Out */}
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center justify-between">
            <div className="truncate mr-2">
              <div className="text-sm font-medium text-white truncate">{user?.user_metadata?.full_name || user?.email || 'User'}</div>
              <div className="text-xs text-slate-400 truncate">{user?.email}</div>
            </div>
            <button 
              onClick={handleSignOut}
              title="Sign Out"
              className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-950/30 transition-colors"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <div className="flex-1 md:pl-64 flex flex-col min-h-screen">
        {/* Top bar for mobile */}
        <header className="h-20 bg-slate-900 border-b border-slate-800 px-6 flex items-center justify-between md:hidden">
          <button onClick={() => setSidebarOpen(true)} className="text-slate-400 hover:text-white">
            <Menu className="w-6 h-6" />
          </button>
          <span className="font-bold text-white">KnowFlow AI</span>
          <div className="w-6"></div>
        </header>

        <main className="flex-1 p-6 sm:p-8 bg-slate-950">
          {children}
        </main>
      </div>
    </div>
  );
}
