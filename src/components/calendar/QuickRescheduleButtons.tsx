"use client";

import React from 'react';

interface QuickRescheduleButtonsProps {
  originalStartTime: string;
  originalDuration: number;
  onQuickMove: (adjustment: { days?: number; hours?: number }) => void;
}

export default function QuickRescheduleButtons({
  originalStartTime,
  originalDuration,
  onQuickMove,
}: QuickRescheduleButtonsProps) {
  return (
    <div className="p-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">Quick Reschedule</h3>
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => onQuickMove({ days: 1 })}
          className="p-4 bg-blue-50 text-blue-700 rounded-lg font-medium hover:bg-blue-100 transition-colors"
        >
          <div className="text-lg">➡️</div>
          <div>Tomorrow</div>
          <div className="text-xs">Same time</div>
        </button>
        
        <button
          onClick={() => onQuickMove({ days: 7 })}
          className="p-4 bg-blue-50 text-blue-700 rounded-lg font-medium hover:bg-blue-100 transition-colors"
        >
          <div className="text-lg">📅</div>
          <div>Next Week</div>
          <div className="text-xs">Same time</div>
        </button>
        
        <button
          onClick={() => onQuickMove({ hours: 1 })}
          className="p-4 bg-green-50 text-green-700 rounded-lg font-medium hover:bg-green-100 transition-colors"
        >
          <div className="text-lg">⏰</div>
          <div>+1 Hour</div>
          <div className="text-xs">Same day</div>
        </button>
        
        <button
          onClick={() => onQuickMove({ hours: -1 })}
          className="p-4 bg-green-50 text-green-700 rounded-lg font-medium hover:bg-green-100 transition-colors"
        >
          <div className="text-lg">⏪</div>
          <div>-1 Hour</div>
          <div className="text-xs">Same day</div>
        </button>
      </div>
    </div>
  );
}