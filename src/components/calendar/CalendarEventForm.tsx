"use client";

import { useState } from "react";

interface CalendarEventFormProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
  initialData?: any;
}

// Helper function to convert ISO timestamp to datetime-local format
const formatDatetimeLocal = (isoString: string) => {
  if (!isoString) return "";
  const date = new Date(isoString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

export default function CalendarEventForm({
  onSubmit,
  onCancel,
  initialData,
}: CalendarEventFormProps) {
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    description: initialData?.description || "",
    activity_type: initialData?.activity_type || "practice",
    start_time: formatDatetimeLocal(initialData?.start_time || ""),
    end_time: formatDatetimeLocal(initialData?.end_time || ""),
    location: initialData?.location || "",
    is_recurring: initialData?.is_recurring || false,
    recurrence_pattern: initialData?.recurrence_pattern || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg">
      <div>
        <label className="block text-sm font-medium mb-1">Title *</label>
        <input
          type="text"
          required
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full px-3 py-2 border rounded-md"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full px-3 py-2 border rounded-md"
          rows={3}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Activity Type *</label>
        <select
          required
          value={formData.activity_type}
          onChange={(e) => setFormData({ ...formData, activity_type: e.target.value })}
          className="w-full px-3 py-2 border rounded-md"
        >
          <option value="practice">Practice</option>
          <option value="gym">Gym</option>
          <option value="match">Match</option>
          <option value="tournament">Tournament</option>
          <option value="education">Education</option>
          <option value="sparring_request">Sparring Request</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Start Time *</label>
          <input
            type="datetime-local"
            required
            value={formData.start_time}
            onChange={(e) => {
              const newStartTime = e.target.value;
              
              if (!newStartTime || !formData.start_time || !formData.end_time) {
                // If any value is missing, just update start time
                setFormData({ ...formData, start_time: newStartTime });
                return;
              }
              
              try {
                const currentStart = new Date(formData.start_time);
                const currentEnd = new Date(formData.end_time);
                const newStart = new Date(newStartTime);
                
                // Calculate duration between current start and end (in milliseconds)
                const duration = currentEnd.getTime() - currentStart.getTime();
                
                // Only auto-sync if duration is positive (valid) and reasonable (< 24 hours)
                if (duration > 0 && duration < 24 * 60 * 60 * 1000) {
                  const newEnd = new Date(newStart.getTime() + duration);
                  
                  setFormData({ 
                    ...formData, 
                    start_time: newStartTime,
                    end_time: newEnd.toISOString().slice(0, 16)
                  });
                } else {
                  // If duration is invalid, just update start time and let user fix end time
                  setFormData({ ...formData, start_time: newStartTime });
                }
              } catch (error) {
                // If date parsing fails, just update start time
                setFormData({ ...formData, start_time: newStartTime });
              }
            }}
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">End Time *</label>
          <input
            type="datetime-local"
            required
            value={formData.end_time}
            onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Location</label>
        <input
          type="text"
          value={formData.location}
          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          className="w-full px-3 py-2 border rounded-md"
        />
      </div>

      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.is_recurring}
            onChange={(e) => setFormData({ 
              ...formData, 
              is_recurring: e.target.checked,
              recurrence_pattern: e.target.checked ? "weekly" : ""
            })}
            className="rounded"
          />
          <span className="text-sm font-medium">Repeat weekly</span>
        </label>
      </div>

      <div className="flex gap-2 justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border rounded-md hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          {initialData ? "Update" : "Create"} Event
        </button>
      </div>
    </form>
  );
}