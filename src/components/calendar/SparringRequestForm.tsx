"use client";

import { useState } from "react";

interface SparringRequestFormProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export default function SparringRequestForm({ onSubmit, onCancel }: SparringRequestFormProps) {
  const [formData, setFormData] = useState({
    partner_name: "",
    date: "",
    start_time: "",
    duration: 60, // Default 1 hour
    notes: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Combine date and time for API
    const startDateTime = new Date(`${formData.date}T${formData.start_time}`);
    const endDateTime = new Date(startDateTime.getTime() + formData.duration * 60 * 1000);
    
    onSubmit({
      title: `Sparring with ${formData.partner_name}`,
      description: formData.notes || `Sparring session with ${formData.partner_name}`,
      activity_type: "sparring_request",
      start_time: startDateTime.toISOString(),
      end_time: endDateTime.toISOString(),
      location: "Tennis Court",
      request_status: "confirmed", // No approval needed
    });
  };

  // Get tomorrow's date as default minimum
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <span>🎾</span>
            Log Sparring Session
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Partner Name */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Partner Name *
              </label>
              <input
                type="text"
                required
                value={formData.partner_name}
                onChange={(e) => setFormData({ ...formData, partner_name: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                placeholder="e.g., John Smith"
              />
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Date *
              </label>
              <input
                type="date"
                required
                min={minDate}
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
              />
            </div>

            {/* Start Time */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Start Time *
              </label>
              <input
                type="time"
                required
                value={formData.start_time}
                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
              />
            </div>

            {/* Duration */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Duration
              </label>
              <select
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
              >
                <option value={30}>30 minutes</option>
                <option value={60}>1 hour</option>
                <option value={90}>1.5 hours</option>
                <option value={120}>2 hours</option>
              </select>
            </div>

            {/* Notes (Optional) */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Notes (Optional)
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                rows={2}
                placeholder="Any additional details..."
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center justify-center gap-2"
              >
                <span>🎾</span>
                Log Session
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}