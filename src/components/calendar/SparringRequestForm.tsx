"use client";

import React, { useState } from 'react';

interface SparringRequestFormProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

type SkillLevel = 'beginner' | 'intermediate' | 'advanced' | 'any';

export default function SparringRequestForm({ onSubmit, onCancel }: SparringRequestFormProps) {
  const [partnerPreference, setPartnerPreference] = useState('');
  const [skillMatch, setSkillMatch] = useState<SkillLevel>('any');
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Combine date and time for start and end
      const startDateTime = new Date(`${startDate}T${startTime}`);
      const endDateTime = new Date(`${endDate}T${endTime}`);

      // Validate dates
      if (startDateTime >= endDateTime) {
        alert('End time must be after start time');
        return;
      }

      if (startDateTime < new Date()) {
        alert('Cannot request sparring in the past');
        return;
      }

      // Validate duration (minimum 30 minutes, maximum 3 hours)
      const durationMs = endDateTime.getTime() - startDateTime.getTime();
      const durationHours = durationMs / (1000 * 60 * 60);
      
      if (durationHours < 0.5) {
        alert('Sparring sessions must be at least 30 minutes');
        return;
      }
      
      if (durationHours > 3) {
        alert('Sparring sessions cannot exceed 3 hours');
        return;
      }

      const requestData = {
        title: `Sparring Request${partnerPreference ? ` with ${partnerPreference}` : ''}`,
        description: `Skill level: ${skillMatch}${notes ? `\n\nNotes: ${notes}` : ''}${partnerPreference ? `\n\nPreferred partner: ${partnerPreference}` : ''}`,
        activity_type: 'sparring_request',
        start_time: startDateTime.toISOString(),
        end_time: endDateTime.toISOString(),
        location: null, // Coach will assign court
        request_status: 'pending',
        skill_preference: skillMatch,
        partner_preference: partnerPreference || null,
        notes: notes || null
      };

      await onSubmit(requestData);
    } catch (error) {
      alert('Failed to submit sparring request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Auto-fill end date when start date changes
  const handleStartDateChange = (date: string) => {
    setStartDate(date);
    if (!endDate) {
      setEndDate(date);
    }
  };

  // Auto-fill end time (1 hour after start) when start time changes
  const handleStartTimeChange = (time: string) => {
    setStartTime(time);
    if (!endTime) {
      const [hours, minutes] = time.split(':');
      const endHour = parseInt(hours) + 1;
      if (endHour < 24) {
        setEndTime(`${endHour.toString().padStart(2, '0')}:${minutes}`);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <span>⚔️</span>
              Request Sparring
            </h2>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Skill Level Matching */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preferred Skill Level
              </label>
              <select
                value={skillMatch}
                onChange={(e) => setSkillMatch(e.target.value as SkillLevel)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="any">Any Level</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Choose your preferred opponent skill level
              </p>
            </div>

            {/* Partner Preference */}
            <div>
              <label htmlFor="partnerPreference" className="block text-sm font-medium text-gray-700 mb-1">
                Preferred Partner (Optional)
              </label>
              <input
                type="text"
                id="partnerPreference"
                value={partnerPreference}
                onChange={(e) => setPartnerPreference(e.target.value)}
                placeholder="e.g., John Smith, anyone from advanced group..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Name a specific person or describe your preference
              </p>
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date *
                </label>
                <input
                  type="date"
                  id="startDate"
                  value={startDate}
                  onChange={(e) => handleStartDateChange(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-1">
                  Start Time *
                </label>
                <input
                  type="time"
                  id="startTime"
                  value={startTime}
                  onChange={(e) => handleStartTimeChange(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                  End Date *
                </label>
                <input
                  type="date"
                  id="endDate"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate || new Date().toISOString().split('T')[0]}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-1">
                  End Time *
                </label>
                <input
                  type="time"
                  id="endTime"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Additional Notes */}
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                Additional Notes (Optional)
              </label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any specific requests, playing style preferences, or other details..."
                rows={3}
                maxLength={200}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                {notes.length}/200 characters
              </p>
            </div>

            {/* Duration Info */}
            <div className="bg-blue-50 p-3 rounded-md">
              <p className="text-sm text-blue-800">
                <strong>💡 Tip:</strong> Sparring sessions are typically 1-2 hours. 
                Coach will assign court and confirm the match.
              </p>
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50 flex items-center gap-2"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <span>⚔️</span>
                    Submit Request
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}