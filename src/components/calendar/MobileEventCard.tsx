"use client";

import React from 'react';

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

interface MobileEventCardProps {
  event: CalendarEvent;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onReschedule: () => void;
  onClone: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

// Utility functions - kept inline for component isolation
const getActivityColor = (type: CalendarEvent["activity_type"]) => 
  ({practice: "bg-blue-500", gym: "bg-green-500", match: "bg-orange-500", tournament: "bg-purple-500", education: "bg-gray-500"})[type];

const getActivityEmoji = (type: CalendarEvent["activity_type"]) => 
  ({practice: "🎾", gym: "💪", match: "🏆", tournament: "🏅", education: "📚"})[type];

const formatTime = (dateString: string) => 
  new Date(dateString).toLocaleTimeString("en-US", {hour: "numeric", minute: "2-digit", hour12: true});

export default function MobileEventCard({
  event,
  isExpanded,
  onToggleExpand,
  onReschedule,
  onClone,
  onEdit,
  onDelete,
}: MobileEventCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Event Header - Always visible */}
      <div 
        className="p-4 cursor-pointer"
        onClick={onToggleExpand}
      >
        <div className="flex items-start">
          {/* Activity Type Indicator */}
          <div className={`w-1 h-full ${getActivityColor(event.activity_type)} absolute left-0 top-0 bottom-0 rounded-l-lg`} />
          
          <div className="flex-1 ml-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{getActivityEmoji(event.activity_type)}</span>
                <div>
                  <h4 className="font-semibold text-lg">{event.title}</h4>
                  <div className="text-sm text-gray-600">
                    {formatTime(event.start_time)} - {formatTime(event.end_time)}
                  </div>
                </div>
              </div>
              
              {/* Expand/Collapse Indicator */}
              <svg 
                className={`w-5 h-5 text-gray-400 transition-transform ${
                  isExpanded ? 'rotate-180' : ''
                }`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            
            {event.location && (
              <div className="flex items-center gap-1 mt-1 text-sm text-gray-500">
                <span>📍</span>
                <span>{event.location}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions - Shown when expanded */}
      {isExpanded && (
        <div className="border-t bg-gray-50 p-4">
          {event.description && (
            <p className="text-gray-600 mb-4">{event.description}</p>
          )}
          
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onReschedule();
              }}
              className="bg-blue-100 text-blue-700 p-3 rounded-lg font-medium flex items-center justify-center gap-2"
            >
              <span>📅</span>
              Reschedule
            </button>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClone();
              }}
              className="bg-green-100 text-green-700 p-3 rounded-lg font-medium flex items-center justify-center gap-2"
            >
              <span>📋</span>
              Clone
            </button>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className="bg-gray-100 text-gray-700 p-3 rounded-lg font-medium flex items-center justify-center gap-2"
            >
              <span>✏️</span>
              Edit
            </button>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="bg-red-100 text-red-700 p-3 rounded-lg font-medium flex items-center justify-center gap-2"
            >
              <span>🗑️</span>
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}