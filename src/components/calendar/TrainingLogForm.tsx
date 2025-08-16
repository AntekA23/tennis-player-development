"use client";

import React, { useState } from "react";

interface TrainingLogFormProps {
  eventId: number;
  participants: Array<{
    user_id: number;
    email: string;
    role: string;
  }>;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

const attendanceOptions = [
  'present',
  'absent', 
  'late',
  'excused'
];

export default function TrainingLogForm({
  eventId,
  participants,
  onSubmit,
  onCancel,
}: TrainingLogFormProps) {
  const [formData, setFormData] = useState({
    player_id: '',
    attendance_status: 'present',
    performance_rating: 7,
    notes: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Filter to only show players
  const players = participants.filter(p => p.role === 'player');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!formData.player_id) {
      setError('Please select a player');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`/api/events/${eventId}/training-log`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          player_id: parseInt(formData.player_id),
          attendance_status: formData.attendance_status,
          performance_rating: formData.performance_rating || null,
          notes: formData.notes || null,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to save training log');
      }

      onSubmit(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save training log');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h2 className="text-xl font-bold mb-4">📋 Log Training Session</h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Player *</label>
            <select
              required
              value={formData.player_id}
              onChange={(e) => setFormData({ ...formData, player_id: e.target.value })}
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="">Select a player...</option>
              {players.map((player) => (
                <option key={player.user_id} value={player.user_id}>
                  {player.email}
                </option>
              ))}
            </select>
            {players.length === 0 && (
              <p className="text-sm text-gray-500 mt-1">No players found for this event</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Attendance *</label>
            <select
              required
              value={formData.attendance_status}
              onChange={(e) => setFormData({ ...formData, attendance_status: e.target.value })}
              className="w-full px-3 py-2 border rounded-md"
            >
              {attendanceOptions.map((option) => (
                <option key={option} value={option}>
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Performance Rating (1-10)
            </label>
            <input
              type="number"
              min="1"
              max="10"
              value={formData.performance_rating}
              onChange={(e) => setFormData({ ...formData, performance_rating: parseInt(e.target.value) || 7 })}
              className="w-full px-3 py-2 border rounded-md"
            />
            <p className="text-xs text-gray-500 mt-1">Optional: Rate player&apos;s performance (1=poor, 10=excellent)</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 border rounded-md"
              rows={3}
              placeholder="Optional notes about the session..."
            />
          </div>

          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="px-4 py-2 border rounded-md hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Training Log'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}