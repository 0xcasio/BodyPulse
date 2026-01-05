"use client";

import { useState, useEffect } from "react";
import { Settings, Save, Loader2, Check, AlertCircle } from "lucide-react";
import { UserProfile } from "@/types/user";
import { updateUserProfile } from "@/lib/db/users";
import { getCurrentUserId } from "@/lib/db/queries";

interface PreferencesSectionProps {
  profile: UserProfile | null;
  onUpdate: (updatedProfile: UserProfile) => void;
}

export default function PreferencesSection({ profile, onUpdate }: PreferencesSectionProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [preferredUnits, setPreferredUnits] = useState<'metric' | 'imperial'>(
    profile?.preferred_units || 'imperial'
  );

  // Update when profile changes
  useEffect(() => {
    if (profile?.preferred_units) {
      setPreferredUnits(profile.preferred_units);
    }
  }, [profile]);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus('idle');
    setErrorMessage(null);

    try {
      const userId = await getCurrentUserId();
      if (!userId) {
        throw new Error('User not authenticated');
      }

      const updatedProfile = await updateUserProfile(userId, {
        preferred_units: preferredUnits,
      });

      if (!updatedProfile) {
        throw new Error('Failed to update preferences');
      }

      onUpdate(updatedProfile);
      setSaveStatus('success');

      // Clear success message after 3 seconds
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      console.error('Error saving preferences:', error);
      setSaveStatus('error');
      setErrorMessage(
        error instanceof Error ? error.message : 'Failed to save preferences. Please try again.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="card-soft p-6">
      <h2 className="text-xl font-display font-semibold text-sage-900 mb-4">
        Preferences
      </h2>
      <p className="text-sm text-sage-600 mb-6">
        Customize your default unit preferences for measurements.
      </p>

      {/* Success/Error Messages */}
      {saveStatus === 'success' && (
        <div className="mb-4 p-3 bg-sage-100 border border-sage-300 rounded-lg flex items-center gap-2 text-sage-700">
          <Check className="w-5 h-5" />
          <span>Preferences updated successfully!</span>
        </div>
      )}

      {saveStatus === 'error' && errorMessage && (
        <div className="mb-4 p-3 bg-terracotta-100 border border-terracotta-300 rounded-lg flex items-center gap-2 text-terracotta-700">
          <AlertCircle className="w-5 h-5" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="space-y-4">
        {/* Unit Preference */}
        <div>
          <label htmlFor="units" className="block text-sm font-medium text-sage-700 mb-2">
            Preferred Unit System
          </label>
          <select
            id="units"
            value={preferredUnits}
            onChange={(e) => {
              setPreferredUnits(e.target.value as 'metric' | 'imperial');
              setSaveStatus('idle');
              setErrorMessage(null);
            }}
            className="w-full px-4 py-2 border-2 border-sage-200 rounded-lg focus:border-sage-400 focus:outline-none text-sage-900"
          >
            <option value="imperial">Imperial (lbs, ft, in)</option>
            <option value="metric">Metric (kg, cm)</option>
          </select>
          <p className="mt-2 text-xs text-sage-600">
            This sets your default unit preferences for new scans. You can still change units for individual scans.
          </p>
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
                <span>Save Preferences</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

