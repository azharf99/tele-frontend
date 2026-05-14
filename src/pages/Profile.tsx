import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import apiClient from '../api/client';
import toast from 'react-hot-toast';
import { Mail, Lock, Save, Eye, EyeOff, User as UserIcon, ShieldCheck, ShieldAlert, Key, Fingerprint, RefreshCcw } from 'lucide-react';
import { AxiosError } from 'axios';

interface ProfileFormData {
  name: string;
  password: string;
  confirmPassword: string;
}

const Profile: React.FC = () => {
  const { user, updateUser } = useAuth();
  
  const [formData, setFormData] = useState<ProfileFormData>({
    name: user?.name || '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.name && !formData.password) {
      toast.error('Update at least one parameter.');
      return false;
    }

    if (formData.password) {
      if (formData.password.length < 6) {
        toast.error('Token length insufficient (min 6).');
        return false;
      }

      if (formData.password !== formData.confirmPassword) {
        toast.error('Token mismatch detected.');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const updateData: { name?: string; password?: string } = {};
      
      if (formData.name && formData.name !== user?.name) {
        updateData.name = formData.name;
      }
      
      if (formData.password) {
        updateData.password = formData.password;
      }

      if (Object.keys(updateData).length === 0) {
        toast.error('No state change detected.');
        setIsLoading(false);
        return;
      }

      await apiClient.put('/profile', updateData);
      
      toast.success('Identity protocols updated.');

      if (updateData.name && user) {
        updateUser({ name: updateData.name });
      }

      setFormData(prev => ({
        ...prev,
        password: '',
        confirmPassword: '',
      }));

    } catch (error: unknown) {
      console.error('Profile update error:', error);
      let errorMessage = 'Protocol update failed.';
      if (error instanceof AxiosError) {
        errorMessage = error.response?.data?.message || errorMessage;
      }
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <header>
        <h1 className="text-4xl font-black tracking-tight mb-2">Operative Profile</h1>
        <p className="text-muted-foreground font-medium">Manage your identity credentials and security tokens.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Identity Card */}
        <div className="space-y-8">
          <div className="bg-card glass border border-border rounded-[3rem] p-10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:scale-110 transition-transform duration-1000">
              <Fingerprint size={160} />
            </div>
            
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="w-24 h-24 bg-indigo-600 rounded-[2rem] flex items-center justify-center text-white mb-6 shadow-2xl shadow-indigo-600/20 ring-4 ring-indigo-600/10">
                <UserIcon size={40} />
              </div>
              <h3 className="text-2xl font-black tracking-tight mb-1">{user?.name}</h3>
              <p className="text-sm font-medium text-muted-foreground mb-6">{user?.email}</p>
              
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-500 text-[10px] font-black uppercase tracking-widest">
                <ShieldCheck size={12} />
                Access: {user?.role}
              </div>
            </div>

            <div className="mt-10 pt-10 border-t border-border space-y-4 relative z-10">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-muted-foreground uppercase tracking-widest">Node Uptime</span>
                <span className="font-black">14.2 Days</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-muted-foreground uppercase tracking-widest">Last Access</span>
                <span className="font-black">Today, 08:42</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-muted-foreground uppercase tracking-widest">IP Verification</span>
                <span className="font-black text-emerald-500 uppercase">Passed</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden group border-b-8 border-rose-500">
            <div className="absolute top-0 right-0 p-6 opacity-10">
              <ShieldAlert size={80} />
            </div>
            <h4 className="text-sm font-black uppercase tracking-widest mb-4">Security Advisory</h4>
            <p className="text-xs text-slate-400 leading-relaxed font-medium">Regularly rotating your access tokens is mandatory for maintaining end-to-end community encryption protocols.</p>
          </div>
        </div>

        {/* Right: Form */}
        <div className="lg:col-span-2">
          <div className="bg-card border border-border rounded-[3rem] p-10 shadow-xl shadow-slate-200/50 dark:shadow-none relative">
            <div className="flex items-center gap-4 mb-10">
              <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-500 ring-1 ring-indigo-500/20">
                <Key size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-black tracking-tight">Identity Modification</h2>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Update Operational Parameters</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-xs font-black text-muted-foreground uppercase tracking-widest ml-1">Identity Display Name</label>
                  <div className="relative group">
                    <UserIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-indigo-500 transition-colors" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Display identity..."
                      className="w-full pl-12 pr-4 py-4 bg-muted border border-border rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-bold text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-2 opacity-60">
                  <label className="text-xs font-black text-muted-foreground uppercase tracking-widest ml-1">Permanent Hub (Email)</label>
                  <div className="relative group">
                    <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="email"
                      value={user?.email || ''}
                      disabled
                      className="w-full pl-12 pr-4 py-4 bg-muted border border-border rounded-2xl cursor-not-allowed font-bold text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-border">
                <div className="space-y-2">
                  <label className="text-xs font-black text-muted-foreground uppercase tracking-widest ml-1">New Access Token</label>
                  <div className="relative group">
                    <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-indigo-500 transition-colors" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="••••••••"
                      className="w-full pl-12 pr-12 py-4 bg-muted border border-border rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-bold text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-indigo-500 transition-colors"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-muted-foreground uppercase tracking-widest ml-1">Confirm Token</label>
                  <div className="relative group">
                    <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-indigo-500 transition-colors" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder="••••••••"
                      className="w-full pl-12 pr-12 py-4 bg-muted border border-border rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-bold text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-indigo-500 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full md:w-auto px-12 py-5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-indigo-600/20 transition-all flex items-center justify-center gap-3 active:scale-[0.98] group"
                >
                  {isLoading ? <RefreshCcw size={18} className="animate-spin" /> : <Save size={18} className="group-hover:scale-110 transition-transform" />}
                  <span>Commit Identity Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
