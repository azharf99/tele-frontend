import React, { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../context/ThemeProvider';
import { 
  LayoutDashboard, 
  List, 
  LogOut, 
  Menu, 
  Bot,
  ChevronRight,
  UserCog,
  Share2,
  Sparkles,
  Settings,
  Sun,
  Moon,
  Search,
  Bell
} from 'lucide-react';

const Layout: React.FC = () => {
  const { logout, user, isAdmin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="flex min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* Sidebar Overlay for Mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 md:hidden" 
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 dark:bg-slate-950 text-white transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 border-r border-white/5
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full p-6">
          <div className="flex items-center gap-3 mb-10 px-2">
            <div className="bg-indigo-600 p-2.5 rounded-2xl shadow-lg shadow-indigo-500/20 group">
              <Bot size={24} className="text-white group-hover:rotate-12 transition-transform" />
            </div>
            <div>
              <h1 className="font-black text-xl tracking-tight">Tele-Gateway</h1>
              <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em] font-bold">Automation Node</p>
            </div>
          </div>

          <nav className="flex-1 space-y-1">
            <NavLink 
              to="/dashboard" 
              end
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
                ${isActive ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-400 hover:bg-white/5 hover:text-white'}
              `}
              onClick={() => setIsSidebarOpen(false)}
            >
              <LayoutDashboard size={20} />
              <span className="font-semibold">Console</span>
              <ChevronRight size={14} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
            </NavLink>
            <NavLink 
              to="/dashboard/rules" 
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
                ${isActive ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-400 hover:bg-white/5 hover:text-white'}
              `}
              onClick={() => setIsSidebarOpen(false)}
            >
              <List size={20} />
              <span className="font-semibold">Bid Rules</span>
              <ChevronRight size={14} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
            </NavLink>
            <NavLink 
              to="/dashboard/groups" 
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
                ${isActive ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-400 hover:bg-white/5 hover:text-white'}
              `}
              onClick={() => setIsSidebarOpen(false)}
            >
              <Share2 size={20} />
              <span className="font-semibold">Groups</span>
              <ChevronRight size={14} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
            </NavLink>
            
            <div className="pt-4 pb-2 px-4">
              <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-bold">Preferences</p>
            </div>

            <NavLink 
              to="/dashboard/ai-settings" 
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
                ${isActive ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-400 hover:bg-white/5 hover:text-white'}
              `}
              onClick={() => setIsSidebarOpen(false)}
            >
              <Sparkles size={20} />
              <span className="font-semibold">AI Assistant</span>
              <ChevronRight size={14} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
            </NavLink>

            {isAdmin && (
              <NavLink 
                to="/dashboard/users" 
                className={({ isActive }) => `
                  flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
                  ${isActive ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-400 hover:bg-white/5 hover:text-white'}
                `}
                onClick={() => setIsSidebarOpen(false)}
              >
                <UserCog size={20} />
                <span className="font-semibold">Operators</span>
                <ChevronRight size={14} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
              </NavLink>
            )}
            
            <NavLink 
              to="/dashboard/profile" 
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
                ${isActive ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-400 hover:bg-white/5 hover:text-white'}
              `}
              onClick={() => setIsSidebarOpen(false)}
            >
              <Settings size={20} />
              <span className="font-semibold">Profile</span>
              <ChevronRight size={14} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
            </NavLink>
          </nav>

          <div className="mt-auto space-y-4">
            <div className="bg-slate-800/50 rounded-2xl p-4 border border-white/5">
              <div className="flex items-center gap-3 mb-1">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold text-slate-300">SYSTEM SECURE</span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium">v1.2.4-stable-prod</p>
            </div>
            
            <button 
              onClick={logout}
              className="flex items-center gap-3 w-full px-4 py-3 text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors group font-semibold"
            >
              <LogOut size={20} />
              <span>Terminate Session</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-20 bg-background/80 backdrop-blur-md border-b border-border sticky top-0 z-30 px-6 flex items-center justify-between">
          <button onClick={toggleSidebar} className="md:hidden p-2 text-slate-500">
            <Menu size={24} />
          </button>

          <div className="hidden md:flex items-center bg-muted/50 border border-border rounded-xl px-4 py-2 w-96 group focus-within:ring-2 ring-indigo-500/20 transition-all">
            <Search size={18} className="text-muted-foreground group-focus-within:text-indigo-500" />
            <input 
              type="text" 
              placeholder="Search commands, rules..." 
              className="bg-transparent border-none outline-none ml-3 text-sm w-full"
            />
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={toggleTheme}
              className="p-2.5 rounded-xl hover:bg-muted transition-colors text-muted-foreground"
              title="Toggle Theme"
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button className="p-2.5 rounded-xl hover:bg-muted transition-colors text-muted-foreground relative">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-indigo-600 rounded-full border-2 border-background" />
            </button>
            <div className="h-8 w-px bg-border mx-2" />
            <div className="flex items-center gap-3 pl-2">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-black tracking-tight">{user?.name}</p>
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">{user?.role}</p>
              </div>
              <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center text-indigo-600 font-bold border border-indigo-200 dark:border-indigo-800">
                {user?.name?.charAt(0)}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 md:p-10 max-w-7xl mx-auto w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
