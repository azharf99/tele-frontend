import React, { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { 
  LayoutDashboard, 
  List, 
  Users, 
  LogOut, 
  Menu, 
  X, 
  Bot,
  User as UserIcon,
  ChevronRight,
  Settings
} from 'lucide-react';

const Layout: React.FC = () => {
  const { logout, user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar Overlay for Mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 md:hidden" 
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 text-white transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full p-6">
          <div className="flex items-center gap-3 mb-10 px-2">
            <div className="bg-indigo-600 p-2.5 rounded-2xl shadow-lg shadow-indigo-500/20">
              <Bot size={24} className="text-white" />
            </div>
            <div>
              <h1 className="font-bold text-xl tracking-tight">Tele-Gateway</h1>
              <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em] font-bold">Userbot Control</p>
            </div>
          </div>

          <nav className="flex-1 space-y-1">
            <NavLink 
              to="/" 
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
                ${isActive ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}
              `}
              onClick={() => setIsSidebarOpen(false)}
            >
              <LayoutDashboard size={20} />
              <span className="font-medium">Dashboard</span>
              <ChevronRight size={14} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
            </NavLink>
            <NavLink 
              to="/rules" 
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
                ${isActive ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}
              `}
              onClick={() => setIsSidebarOpen(false)}
            >
              <List size={20} />
              <span className="font-medium">Bid Rules</span>
              <ChevronRight size={14} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
            </NavLink>
            <NavLink 
              to="/groups" 
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
                ${isActive ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}
              `}
              onClick={() => setIsSidebarOpen(false)}
            >
              <Users size={20} />
              <span className="font-medium">Groups</span>
              <ChevronRight size={14} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
            </NavLink>
            <NavLink 
              to="/profile" 
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
                ${isActive ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}
              `}
              onClick={() => setIsSidebarOpen(false)}
            >
              <Settings size={20} />
              <span className="font-medium">Profile</span>
              <ChevronRight size={14} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
            </NavLink>
          </nav>

          <div className="pt-6 border-t border-slate-800/50">
            <div className="flex items-center gap-3 px-4 py-4 mb-4 bg-slate-800/40 rounded-2xl">
              <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center border border-slate-600/50">
                <UserIcon size={20} className="text-slate-300" />
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-bold truncate">{user?.name}</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">{user?.role}</p>
              </div>
            </div>
            <button 
              onClick={logout} 
              className="flex items-center gap-3 w-full px-4 py-3 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all duration-200"
            >
              <LogOut size={20} />
              <span className="font-medium">Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top Header for Mobile */}
        <header className="flex md:hidden items-center justify-between p-4 bg-white border-b border-slate-200">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-1.5 rounded-lg">
              <Bot size={18} className="text-white" />
            </div>
            <span className="font-bold text-slate-900 tracking-tight">Tele-Gateway</span>
          </div>
          <button 
            onClick={toggleSidebar} 
            className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </header>

        <div className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
