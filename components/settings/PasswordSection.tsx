"use client";

import { useState } from "react";
import { Lock, Eye, EyeOff, Check, AlertCircle, Loader2 } from "lucide-react";
import { updatePassword } from "@/lib/auth";

export default function PasswordSection() {
  const [isChanging, setIsChanging] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    setStatus('idle');
    setErrorMessage(null);
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const validatePassword = (password: string): string | null => {
    if (password.length < 8) {
      return 'Password must be at least 8 characters long';
    }
    if (!/[A-Z]/.test(password)) {
      return 'Password must contain at least one uppercase letter';
    }
    if (!/[a-z]/.test(password)) {
      return 'Password must contain at least one lowercase letter';
    }
    if (!/[0-9]/.test(password)) {
      return 'Password must contain at least one number';
    }
    return null;
  };

  const getPasswordStrength = (password: string): { strength: 'weak' | 'medium' | 'strong'; color: string } => {
    if (password.length === 0) {
      return { strength: 'weak', color: 'bg-sage-200' };
    }
    
    const hasLength = password.length >= 8;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    const criteriaMet = [hasLength, hasUpper, hasLower, hasNumber, hasSpecial].filter(Boolean).length;

    if (criteriaMet <= 2) {
      return { strength: 'weak', color: 'bg-terracotta-400' };
    } else if (criteriaMet <= 4) {
      return { strength: 'medium', color: 'bg-amber-400' };
    } else {
      return { strength: 'strong', color: 'bg-sage-500' };
    }
  };

  const handleChangePassword = async () => {
    // Validation
    if (!formData.currentPassword) {
      setStatus('error');
      setErrorMessage('Please enter your current password');
      return;
    }

    if (!formData.newPassword) {
      setStatus('error');
      setErrorMessage('Please enter a new password');
      return;
    }

    const validationError = validatePassword(formData.newPassword);
    if (validationError) {
      setStatus('error');
      setErrorMessage(validationError);
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setStatus('error');
      setErrorMessage('New passwords do not match');
      return;
    }

    if (formData.currentPassword === formData.newPassword) {
      setStatus('error');
      setErrorMessage('New password must be different from current password');
      return;
    }

    setIsChanging(true);
    setStatus('idle');
    setErrorMessage(null);

    try {
      const { error } = await updatePassword(formData.newPassword);
      
      if (error) {
        throw error;
      }

      setStatus('success');
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });

      // Clear success message after 3 seconds
      setTimeout(() => setStatus('idle'), 3000);
    } catch (error) {
      console.error('Error changing password:', error);
      setStatus('error');
      setErrorMessage(
        error instanceof Error 
          ? error.message 
          : 'Failed to change password. Please try again.'
      );
    } finally {
      setIsChanging(false);
    }
  };

  const passwordStrength = getPasswordStrength(formData.newPassword);

  return (
    <div className="card-soft p-6">
      <h2 className="text-xl font-display font-semibold text-sage-900 mb-4">
        Change Password
      </h2>
      <p className="text-sm text-sage-600 mb-6">
        Update your password to keep your account secure.
      </p>

      {/* Success/Error Messages */}
      {status === 'success' && (
        <div className="mb-4 p-3 bg-sage-100 border border-sage-300 rounded-lg flex items-center gap-2 text-sage-700">
          <Check className="w-5 h-5" />
          <span>Password changed successfully!</span>
        </div>
      )}

      {status === 'error' && errorMessage && (
        <div className="mb-4 p-3 bg-terracotta-100 border border-terracotta-300 rounded-lg flex items-center gap-2 text-terracotta-700">
          <AlertCircle className="w-5 h-5" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="space-y-4">
        {/* Current Password */}
        <div>
          <label htmlFor="currentPassword" className="block text-sm font-medium text-sage-700 mb-2">
            Current Password
          </label>
          <div className="relative">
            <input
              type={showPasswords.current ? 'text' : 'password'}
              id="currentPassword"
              value={formData.currentPassword}
              onChange={(e) => handleInputChange('currentPassword', e.target.value)}
              className="w-full px-4 py-2 pr-10 border-2 border-sage-200 rounded-lg focus:border-sage-400 focus:outline-none text-sage-900"
              placeholder="Enter current password"
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility('current')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-sage-500 hover:text-sage-700"
            >
              {showPasswords.current ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* New Password */}
        <div>
          <label htmlFor="newPassword" className="block text-sm font-medium text-sage-700 mb-2">
            New Password
          </label>
          <div className="relative">
            <input
              type={showPasswords.new ? 'text' : 'password'}
              id="newPassword"
              value={formData.newPassword}
              onChange={(e) => handleInputChange('newPassword', e.target.value)}
              className="w-full px-4 py-2 pr-10 border-2 border-sage-200 rounded-lg focus:border-sage-400 focus:outline-none text-sage-900"
              placeholder="Enter new password"
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility('new')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-sage-500 hover:text-sage-700"
            >
              {showPasswords.new ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
          
          {/* Password Strength Indicator */}
          {formData.newPassword && (
            <div className="mt-2">
              <div className="flex items-center gap-2 mb-1">
                <div className="flex-1 h-2 bg-sage-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${passwordStrength.color}`}
                    style={{
                      width: passwordStrength.strength === 'weak' ? '33%' : 
                             passwordStrength.strength === 'medium' ? '66%' : '100%'
                    }}
                  />
                </div>
                <span className="text-xs text-sage-600 capitalize">
                  {passwordStrength.strength}
                </span>
              </div>
              <p className="text-xs text-sage-600">
                Password must be at least 8 characters with uppercase, lowercase, and numbers
              </p>
            </div>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-sage-700 mb-2">
            Confirm New Password
          </label>
          <div className="relative">
            <input
              type={showPasswords.confirm ? 'text' : 'password'}
              id="confirmPassword"
              value={formData.confirmPassword}
              onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
              className="w-full px-4 py-2 pr-10 border-2 border-sage-200 rounded-lg focus:border-sage-400 focus:outline-none text-sage-900"
              placeholder="Confirm new password"
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility('confirm')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-sage-500 hover:text-sage-700"
            >
              {showPasswords.confirm ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
          {formData.confirmPassword && formData.newPassword !== formData.confirmPassword && (
            <p className="mt-1 text-xs text-terracotta-600">
              Passwords do not match
            </p>
          )}
        </div>

        {/* Change Password Button */}
        <div className="pt-4">
          <button
            onClick={handleChangePassword}
            disabled={isChanging}
            className="btn-organic flex items-center gap-2 justify-center disabled:opacity-50 disabled:cursor-not-allowed w-full md:w-auto"
          >
            {isChanging ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Changing Password...</span>
              </>
            ) : (
              <>
                <Lock className="w-5 h-5" />
                <span>Change Password</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

