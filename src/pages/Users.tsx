import React, { useState, useEffect } from 'react';
import apiClient from '../api/client';
import { type User, type Role } from '../types';
import toast from 'react-hot-toast';
import { AxiosError } from 'axios';
import {
  Users as UsersIcon,
  UserPlus,
  Edit2,
  Trash2,
  Search,
  Mail,
  Lock,
  Shield,
  Loader2,
  AlertCircle,
  ShieldCheck,
  UserCog,
  ShieldAlert
} from 'lucide-react';

const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentUser, setCurrentUser] = useState<Partial<User> | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Siswa' as Role
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get('/users');
      setUsers(response.data);
    } catch (error: unknown) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setIsEditing(false);
    setCurrentUser(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'Siswa'
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (user: User) => {
    setIsEditing(true);
    setCurrentUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (isEditing && currentUser) {
        // Update User
        const payload: { name: string; role: Role; password?: string } = {
          name: formData.name,
          role: formData.role
        };
        if (formData.password) payload.password = formData.password;

        await apiClient.put(`/users/${currentUser.id}`, payload);
        toast.success('User updated');
      } else {
        // Create User
        await apiClient.post('/users', formData);
        toast.success('User created');
      }
      handleCloseModal();
      fetchUsers();
    } catch (error: unknown) {
      console.error('Error saving user:', error);
      let errorMessage = 'Failed to save user';
      if (error instanceof AxiosError) {
        errorMessage = error.response?.data?.message || errorMessage;
      }
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async (id: number) => {
    if (!window.confirm('Terminate this operator session?')) return;

    try {
      await apiClient.delete(`/users/${id}`);
      toast.success('User terminated');
      fetchUsers();
    } catch (error: unknown) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
    }
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight mb-2">Operations Center</h1>
          <p className="text-muted-foreground font-medium">Control node access levels and operative permissions.</p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-2 group"
        >
          <UserPlus size={18} className="group-hover:scale-110 transition-transform" />
          <span>Authorize Operative</span>
        </button>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card border border-border p-8 rounded-[2rem] flex items-center gap-6">
          <div className="w-14 h-14 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-500 ring-1 ring-indigo-500/20">
            <UsersIcon size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Total Operators</p>
            <p className="text-3xl font-black tracking-tighter">{users.length}</p>
          </div>
        </div>
        <div className="bg-card border border-border p-8 rounded-[2rem] flex items-center gap-6">
          <div className="w-14 h-14 bg-purple-500/10 rounded-2xl flex items-center justify-center text-purple-500 ring-1 ring-purple-500/20">
            <ShieldCheck size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Administrative Nodes</p>
            <p className="text-3xl font-black tracking-tighter">{users.filter(u => u.role === 'Admin').length}</p>
          </div>
        </div>
        <div className="bg-card border border-border p-8 rounded-[2rem] flex items-center gap-6">
          <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 ring-1 ring-emerald-500/20">
            <ShieldAlert size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Active Protocols</p>
            <p className="text-3xl font-black tracking-tighter">SECURE</p>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-[2.5rem] border border-border overflow-hidden shadow-xl shadow-slate-200/50 dark:shadow-none">
        <div className="p-6 border-b border-border bg-muted/30">
          <div className="relative group max-w-md">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-indigo-500 transition-colors" />
            <input
              type="text"
              placeholder="Search operative identity..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-background border border-border rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-bold text-sm"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/50 border-b border-border">
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">ID</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Operative Identity</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Communication Hub</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Clearance Level</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right">Node Controls</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <Loader2 className="mx-auto animate-spin text-indigo-500 mb-4" size={32} />
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Syncing Database...</p>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <AlertCircle className="mx-auto text-muted-foreground mb-4" size={32} />
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">No Operatives Detected</p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-muted/30 transition-colors group">
                    <td className="px-6 py-5 text-muted-foreground font-mono text-xs">#{user.id}</td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-600 font-black text-sm border border-indigo-500/20">
                          {user.name.charAt(0)}
                        </div>
                        <div className="font-black text-sm tracking-tight">{user.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-sm font-medium text-muted-foreground">{user.email}</td>
                    <td className="px-6 py-5">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border transition-colors ${user.role === 'Admin'
                        ? 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20'
                        : 'bg-slate-500/10 text-slate-500 border-slate-500/20'
                        }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleOpenEditModal(user)}
                          className="p-2 text-indigo-500 hover:bg-indigo-500 hover:text-white rounded-xl transition-all"
                          title="Edit Identity"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="p-2 text-rose-500 hover:bg-rose-500 hover:text-white rounded-xl transition-all"
                          title="Revoke Access"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Authorize Operative Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300" onClick={handleCloseModal}></div>
          <div className="relative w-full max-w-lg bg-card border border-border rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 p-10">
            <header className="mb-10 text-center">
              <div className="w-16 h-16 bg-indigo-600/10 rounded-[1.5rem] flex items-center justify-center text-indigo-600 mb-6 mx-auto ring-1 ring-indigo-600/20">
                <UserCog size={32} />
              </div>
              <h2 className="text-3xl font-black tracking-tight mb-2">
                {isEditing ? 'Modify Clearance' : 'Authorize Identity'}
              </h2>
              <p className="text-muted-foreground font-medium">Configure operative permissions and node access credentials.</p>
            </header>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-muted-foreground uppercase tracking-widest ml-1">Operative Name</label>
                <div className="relative group">
                  <UsersIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-indigo-500 transition-colors" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="Full identity name..."
                    className="w-full pl-12 pr-4 py-4 bg-muted border border-border rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-bold text-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-muted-foreground uppercase tracking-widest ml-1">Communications Channel</label>
                <div className="relative group">
                  <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-indigo-500 transition-colors" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    disabled={isEditing}
                    placeholder="operative@node.secure"
                    className={`w-full pl-12 pr-4 py-4 bg-muted border border-border rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-bold text-sm ${isEditing ? 'opacity-50 cursor-not-allowed' : ''}`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-muted-foreground uppercase tracking-widest ml-1">Clearance Level</label>
                  <div className="relative group">
                    <Shield size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-indigo-500 transition-colors" />
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleInputChange}
                      className="w-full pl-12 pr-4 py-4 bg-muted border border-border rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-bold text-sm appearance-none"
                    >
                      <option value="Siswa">Operative (Siswa)</option>
                      <option value="Admin">Administrator</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-muted-foreground uppercase tracking-widest ml-1">Access Token</label>
                  <div className="relative group">
                    <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-indigo-500 transition-colors" />
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required={!isEditing}
                      placeholder={isEditing ? 'Unchanged' : '••••••••'}
                      className="w-full pl-12 pr-4 py-4 bg-muted border border-border rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-bold text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-6">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 py-4 bg-muted hover:bg-border text-foreground font-black uppercase tracking-widest text-xs rounded-2xl transition-all"
                >
                  Terminate
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-[2] flex items-center justify-center gap-2 py-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-black uppercase tracking-widest text-xs rounded-2xl transition-all shadow-xl shadow-indigo-600/20"
                >
                  {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : (isEditing ? 'Update Clearance' : 'Authorize Node')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
