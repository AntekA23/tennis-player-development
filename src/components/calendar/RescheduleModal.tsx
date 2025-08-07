"use client";

import React, { useState } from 'react';
import QuickRescheduleButtons from './QuickRescheduleButtons';

interface CalendarEvent {
  id: number;
  title: string;
  description: string | null;
  activity_type: "practice" | "gym" | "match" | "tournament" | "education";
  start_time: string;
  end_time: string;
  location: string | null;
  created_by: number;
}

interface RescheduleModalProps {
  event: CalendarEvent;
  onSubmit: (data: { start_time: string; end_time: string }) => void;
  onCancel: () => void;
}

export default function RescheduleModal({ event, onSubmit, onCancel }: RescheduleModalProps) {
  const [startDate, setStartDate] = useState(event.start_time.split('T')[0]);
  const [startTime, setStartTime] = useState(
    new Date(event.start_time).toTimeString().slice(0, 5)
  );
  
  // Calculate duration
  const originalDuration = 
    (new Date(event.end_time).getTime() - new Date(event.start_time).getTime()) / (1000 * 60 * 60);
  
  const handleQuickMove = (adjustment: { days?: number; hours?: number }) => {
    const newStart = new Date(event.start_time);
    
    if (adjustment.days) {
      newStart.setDate(newStart.getDate() + adjustment.days);
    }
    if (adjustment.hours) {
      newStart.setHours(newStart.getHours() + adjustment.hours);
    }
    
    const newEnd = new Date(newStart);
    newEnd.setHours(newEnd.getHours() + originalDuration);
    
    onSubmit({
      start_time: newStart.toISOString(),
      end_time: newEnd.toISOString(),
    });
  };
  
  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newStart = new Date(`${startDate}T${startTime}`);
    const newEnd = new Date(newStart);
    newEnd.setHours(newEnd.getHours() + originalDuration);
    
    onSubmit({
      start_time: newStart.toISOString(),
      end_time: newEnd.toISOString(),
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50">
      <div className="bg-white w-full sm:w-auto sm:min-w-[400px] rounded-t-2xl sm:rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">Reschedule Event</h2>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-full"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Event Info */}
        <div className="p-4 bg-gray-50">
          <div className="text-lg font-semibold">{event.title}</div>
          <div className="text-sm text-gray-600">
            Duration: {originalDuration} hour{originalDuration !== 1 ? 's' : ''}
          </div>
        </div>

        <QuickRescheduleButtons
          originalStartTime={event.start_time}
          originalDuration={originalDuration}
          onQuickMove={handleQuickMove}
        />

        {/* Custom Date/Time */}
        <form onSubmit={handleCustomSubmit} className="p-4 border-t">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Custom Date & Time</h3>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full p-3 border rounded-lg text-base"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Time
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full p-3 border rounded-lg text-base"
                required
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 mt-6">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
            >
              Reschedule
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}