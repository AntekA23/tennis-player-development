"use client";

import { useState, useEffect } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  initialDate?: string; // 'YYYY-MM-DD'
  initialTime?: string; // 'HH:mm'
  onConfirm: (p: { date: string; time: string; location?: string; notes?: string }) => void;
};

export default function SparringQuickAddModal({
  open,
  onClose,
  initialDate,
  initialTime,
  onConfirm,
}: Props) {
  const [date, setDate] = useState(initialDate || '');
  const [time, setTime] = useState(initialTime || '');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (open) {
      setDate(initialDate || '');
      setTime(initialTime || '');
      setLocation('');
      setNotes('');
    }
  }, [open, initialDate, initialTime]);

  const isValid = date.length === 10 && time.length === 5; // Basic validation

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">Quick Add Sparring</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Date *</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Time *</label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="Optional"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
                rows={2}
                placeholder="Optional"
              />
            </div>
          </div>
          
          <div className="flex gap-3 mt-6">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={() => onConfirm({ date, time, location, notes })}
              disabled={!isValid}
              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}