"use client";

import React from 'react';

interface CalendarEvent {
  id: number;
  title: string;
  description: string | null;
  activity_type: "practice" | "gym" | "match" | "tournament" | "education" | "sparring_request";
  start_time: string;
  end_time: string;
  location: string | null;
  created_by: number;
}

interface MobileEventCardProps {
  event: CalendarEvent;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onReschedule?: () => void;
  onClone?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onApproveSparring?: (eventId: number) => void;
  onDeclineSparring?: (eventId: number) => void;
  onLogTraining?: () => void;
  userRole?: 'coach' | 'parent' | 'player';
}

// Utility functions - kept inline for component isolation
const getActivityColor = (type: CalendarEvent["activity_type"]) => 
  ({practice: "bg-blue-500", gym: "bg-green-500", match: "bg-red-500", tournament: "bg-purple-500", education: "bg-gray-500", sparring_request: "bg-orange-500"})[type];

const getActivityEmoji = (type: CalendarEvent["activity_type"]) => 
  ({practice: "🎾", gym: "💪", match: "🏆", tournament: "🏅", education: "📚", sparring_request: "🎾"})[type];

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
  onApproveSparring,
  onDeclineSparring,
  onLogTraining,
  userRole = 'player',
}: MobileEventCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Compact Event Header - Exactly 2 lines */}
      <div 
        className="p-3 cursor-pointer"
        onClick={onToggleExpand}
      >
        <div className="flex items-center">
          {/* Activity Type Indicator */}
          <div className={`w-1 h-12 ${getActivityColor(event.activity_type)} rounded-l-lg absolute left-0`} />
          
          <div className="flex-1 ml-3 min-w-0"> {/* min-w-0 for text truncation */}
            {/* Line 1: Title + Time + Icon */}
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <span className="text-lg flex-shrink-0">{getActivityEmoji(event.activity_type)}</span>
                <h4 className="font-semibold text-base truncate">{event.title}</h4>
                {event.activity_type === 'sparring_request' && (
                  <span className="bg-orange-100 text-orange-700 text-xs px-2 py-1 rounded-full font-medium">
                    Sparring
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-xs font-medium text-gray-600">
                  {formatTime(event.start_time)}
                </span>
                <svg 
                  className={`w-4 h-4 text-gray-400 transition-transform ${
                    isExpanded ? 'rotate-180' : ''
                  }`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            
            {/* Line 2: Duration + Location */}
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>
                {formatTime(event.start_time)} - {formatTime(event.end_time)}
              </span>
              {event.location && (
                <span className="flex items-center gap-1 truncate max-w-32">
                  <span>📍</span>
                  <span className="truncate">{event.location}</span>
                </span>
              )}
            </div>
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
            {onReschedule && (
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
            )}
            
            {onClone && (
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
            )}
            
            {onEdit && (
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
            )}
            
            {onDelete && (
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
            )}

            {onLogTraining && ['practice', 'gym', 'education'].includes(event.activity_type) && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onLogTraining();
                }}
                className="bg-yellow-100 text-yellow-700 p-3 rounded-lg font-medium flex items-center justify-center gap-2"
              >
                <span>📋</span>
                Log Training
              </button>
            )}

            
            {!onReschedule && !onClone && !onEdit && !onDelete && !onApproveSparring && !onLogTraining && (
              <div className="col-span-2 text-center text-gray-500 p-3">
                View-only schedule
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}