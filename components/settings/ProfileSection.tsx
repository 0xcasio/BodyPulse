"use client";

import { useState, useEffect } from "react";
import { Save, Loader2, Check, AlertCircle } from "lucide-react";
import { UserProfile } from "@/types/user";
import { updateUserProfile } from "@/lib/db/users";
import { getCurrentUserId } from "@/lib/db/queries";

interface ProfileSectionProps {
  profile: UserProfile | null;
  onUpdate: (updatedProfile: UserProfile) => void;
}

export default function ProfileSection({ profile, onUpdate }: ProfileSectionProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: profile?.name || '',
    birthday: profile?.birthday ? profile.birthday.split('T')[0] : '', // Extract date part from ISO string
    default_height: profile?.default_height?.toString() || '',
    default_height_unit: profile?.default_height_unit || 'ft',
    default_weight: profile?.default_weight?.toString() || '',
    default_weight_unit: profile?.default_weight_unit || 'lbs',
    default_gender: profile?.default_gender || '',
  });

  // Update form data when profile changes
  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        birthday: profile.birthday ? profile.birthday.split('T')[0] : '',
        default_height: profile.default_height?.toString() || '',
        default_height_unit: profile.default_height_unit || 'ft',
        default_weight: profile.default_weight?.toString() || '',
        default_weight_unit: profile.default_weight_unit || 'lbs',
        default_gender: profile.default_gender || '',
      });
    }
  }, [profile]);

  const handleInputChange = (
    field: keyof typeof formData,
    value: string
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    setSaveStatus('idle');
    setErrorMessage(null);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus('idle');
    setErrorMessage(null);

    try {
      const userId = await getCurrentUserId();
      if (!userId) {
        throw new Error('User not authenticated');
      }

      // Prepare update data
      const updates: Partial<UserProfile> = {
        name: formData.name.trim() || undefined,
        birthday: formData.birthday.trim() || undefined,
        default_height: formData.default_height ? parseFloat(formData.default_height) : undefined,
        default_height_unit: formData.default_height_unit || undefined,
        default_weight: formData.default_weight ? parseFloat(formData.default_weight) : undefined,
        default_weight_unit: formData.default_weight_unit || undefined,
        default_gender: formData.default_gender || undefined,
      };

      // Remove undefined values
      Object.keys(updates).forEach(key => {
        if (updates[key as keyof typeof updates] === undefined) {
          delete updates[key as keyof typeof updates];
        }
      });

      const updatedProfile = await updateUserProfile(userId, updates);
      
      if (!updatedProfile) {
        throw new Error('Failed to update profile');
      }

      onUpdate(updatedProfile);
      setSaveStatus('success');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      console.error('Error saving profile:', error);
      setSaveStatus('error');
      setErrorMessage(
        error instanceof Error ? error.message : 'Failed to save profile. Please try again.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="card-soft p-6">
      <h2 className="text-xl font-display font-semibold text-sage-900 mb-4">
        Profile Information
      </h2>
      <p className="text-sm text-sage-600 mb-6">
        Set your default personal information. These values will be used for new scans.
      </p>

      {/* Success/Error Messages */}
      {saveStatus === 'success' && (
        <div className="mb-4 p-3 bg-sage-100 border border-sage-300 rounded-lg flex items-center gap-2 text-sage-700">
          <Check className="w-5 h-5" />
          <span>Profile updated successfully!</span>
        </div>
      )}

      {saveStatus === 'error' && errorMessage && (
        <div className="mb-4 p-3 bg-terracotta-100 border border-terracotta-300 rounded-lg flex items-center gap-2 text-terracotta-700">
          <AlertCircle className="w-5 h-5" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="space-y-4">
        {/* Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-sage-700 mb-2">
            Full Name
          </label>
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className="w-full px-4 py-2 border-2 border-sage-200 rounded-lg focus:border-sage-400 focus:outline-none text-sage-900"
            placeholder="Enter your name"
          />
        </div>

        {/* Birthday */}
        <div>
          <label htmlFor="birthday" className="block text-sm font-medium text-sage-700 mb-2">
            Birthday
          </label>
          <input
            type="date"
            id="birthday"
            value={formData.birthday}
            onChange={(e) => handleInputChange('birthday', e.target.value)}
            className="w-full px-4 py-2 border-2 border-sage-200 rounded-lg focus:border-sage-400 focus:outline-none text-sage-900"
            max={new Date().toISOString().split('T')[0]} // Can't be in the future
          />
          <p className="mt-1 text-xs text-sage-600">
            Your age will be automatically calculated from your birthday for each scan. Age is calculated based on the scan date, so it will be accurate across different years.
          </p>
        </div>

        {/* Gender */}
        <div>
          <label htmlFor="gender" className="block text-sm font-medium text-sage-700 mb-2">
            Gender
          </label>
          <select
            id="gender"
            value={formData.default_gender}
            onChange={(e) => handleInputChange('default_gender', e.target.value)}
            className="w-full px-4 py-2 border-2 border-sage-200 rounded-lg focus:border-sage-400 focus:outline-none text-sage-900"
          >
            <option value="">Select gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>

        {/* Height */}
        <div>
          <label htmlFor="height" className="block text-sm font-medium text-sage-700 mb-2">
            Height
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              id="height"
              step="0.1"
              min="0"
              value={formData.default_height}
              onChange={(e) => handleInputChange('default_height', e.target.value)}
              className="flex-1 px-4 py-2 border-2 border-sage-200 rounded-lg focus:border-sage-400 focus:outline-none text-sage-900"
              placeholder="Enter height"
            />
            <select
              value={formData.default_height_unit}
              onChange={(e) => handleInputChange('default_height_unit', e.target.value)}
              className="px-4 py-2 border-2 border-sage-200 rounded-lg focus:border-sage-400 focus:outline-none text-sage-900"
            >
              <option value="ft">ft</option>
              <option value="in">in</option>
              <option value="cm">cm</option>
            </select>
          </div>
        </div>

        {/* Weight */}
        <div>
          <label htmlFor="weight" className="block text-sm font-medium text-sage-700 mb-2">
            Default Weight
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              id="weight"
              step="0.1"
              min="0"
              value={formData.default_weight}
              onChange={(e) => handleInputChange('default_weight', e.target.value)}
              className="flex-1 px-4 py-2 border-2 border-sage-200 rounded-lg focus:border-sage-400 focus:outline-none text-sage-900"
              placeholder="Enter weight"
            />
            <select
              value={formData.default_weight_unit}
              onChange={(e) => handleInputChange('default_weight_unit', e.target.value)}
              className="px-4 py-2 border-2 border-sage-200 rounded-lg focus:border-sage-400 focus:outline-none text-sage-900"
            >
              <option value="lbs">lbs</option>
              <option value="kg">kg</option>
            </select>
          </div>
        </div>

        {/* Save Button */}
        <div className="pt-4">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="btn-organic flex items-center gap-2 justify-center disabled:opacity-50 disabled:cursor-not-allowed w-full md:w-auto"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                <span>Save Profile</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

