import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import apiClient from '../api/client';
import toast from 'react-hot-toast';
import { Mail, Lock, Save, Eye, EyeOff, User as UserIcon } from 'lucide-react';
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
    // Check if at least one field is being updated
    if (!formData.name && !formData.password) {
      toast.error('Please update at least one field (name or password)');
      return false;
    }

    // Validate password if provided
    if (formData.password) {
      if (formData.password.length < 6) {
        toast.error('Password must be at least 6 characters long');
        return false;
      }

      if (formData.password !== formData.confirmPassword) {
        toast.error('Password and confirm password do not match');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

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
        toast.error('No changes detected');
        setIsLoading(false);
        return;
      }

      const response = await apiClient.put('/profile', updateData);
      
      toast.success(response.data.message || 'Profile updated successfully');

      // Update user context with new name if it was changed
      if (updateData.name && user) {
        updateUser({ name: updateData.name });
      }

      // Clear password fields after successful update
      setFormData(prev => ({
        ...prev,
        password: '',
        confirmPassword: '',
      }));

    } catch (error: unknown) {
      console.error('Profile update error:', error);
      let errorMessage = 'Failed to update profile';
      if (error instanceof AxiosError) {
        errorMessage = error.response?.data?.message || errorMessage;
      }
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Profile Settings</h1>
          <p className="text-slate-400">Update your account information</p>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-8">
          {/* Current User Info */}
          <div className="mb-8 p-4 bg-slate-700/30 rounded-xl">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-slate-600 flex items-center justify-center">
                <UserIcon size={32} className="text-slate-300" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white">{user?.name}</h3>
                <p className="text-slate-400">{user?.email}</p>
                <p className="text-sm text-slate-500 uppercase tracking-wider">{user?.role}</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Field */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-2">
                <UserIcon size={16} className="inline mr-2" />
                Full Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter your full name"
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>

            {/* Email Field (Read-only) */}
            <div>
              <label className="block text-sm font-medium text-slate-500 mb-2">
                <Mail size={16} className="inline mr-2" />
                Email Address (Permanent)
              </label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-slate-500 cursor-not-allowed"
              />
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
                <Lock size={16} className="inline mr-2" />
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter new password"
                  className="w-full px-4 py-3 pr-12 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <p className="mt-1 text-xs text-slate-500">Leave empty to keep current password</p>
            </div>

            {/* Confirm Password Field */}
            {formData.password && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-300 mb-2">
                  <Lock size={16} className="inline mr-2" />
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Confirm new password"
                    className="w-full px-4 py-3 pr-12 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800/50 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
              >
                <Save size={20} />
                {isLoading ? 'Updating...' : 'Update Profile'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
