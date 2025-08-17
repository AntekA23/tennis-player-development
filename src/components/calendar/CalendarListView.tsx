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

interface CalendarListViewProps {
  events: CalendarEvent[];
  loading: boolean;
  onEditEvent?: (event: CalendarEvent) => void;
  onDeleteEvent?: (id: number) => void;
  onCloneEvent?: (event: CalendarEvent) => void;
  onCreateEvent?: () => void;
  onLogTraining?: (event: CalendarEvent) => void;
}

// Display label mapping helper
const getDisplayActivityType = (type: CalendarEvent["activity_type"]) => {
  return type === 'sparring_request' ? 'sparring' : type;
};

const getActivityColor = (type: CalendarEvent["activity_type"]) => {
  const colors = {
    practice: "bg-blue-100 text-blue-800",
    gym: "bg-green-100 text-green-800",
    match: "bg-red-100 text-red-800",
    tournament: "bg-purple-100 text-purple-800",
    education: "bg-yellow-100 text-yellow-800",
    sparring_request: "bg-orange-100 text-orange-800",
  };
  return colors[type];
};

const formatDateTime = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Empty state for list view
const EmptyList = ({ onCreateEvent }: { onCreateEvent?: () => void }) => (
  <div className="text-gray-500 text-center py-8">
    <div className="text-4xl mb-4">📋</div>
    <h3 className="text-lg font-semibold mb-2">No events scheduled</h3>
    <p className="mb-4">
      {onCreateEvent ? "Create your first team event to get started!" : "No events to display"}
    </p>
    {onCreateEvent && (
      <button 
        onClick={onCreateEvent}
        className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
      >
        Create First Event
      </button>
    )}
  </div>
);

export default function CalendarListView({ 
  events, 
  loading, 
  onEditEvent, 
  onDeleteEvent, 
  onCloneEvent,
  onCreateEvent,
  onLogTraining 
}: CalendarListViewProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
        <span className="ml-3">Loading events...</span>
      </div>
    );
  }

  if (events.length === 0) {
    return <EmptyList onCreateEvent={onCreateEvent} />;
  }

  return (
    <div className="space-y-4">
      {events.map((event) => (
        <div
          key={event.id}
          className="border rounded-lg p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{event.title}</h3>
              {event.description && (
                <p className="text-gray-600 mt-1">{event.description}</p>
              )}
              <div className="mt-2 space-y-1 text-sm text-gray-500">
                <div>📅 {formatDateTime(event.start_time)} - {formatDateTime(event.end_time)}</div>
                {event.location && <div>📍 {event.location}</div>}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${getActivityColor(
                  event.activity_type
                )}`}
              >
                {getDisplayActivityType(event.activity_type)}
              </span>
              {onCloneEvent && (
                <button
                  onClick={() => onCloneEvent(event)}
                  className="text-green-600 hover:text-green-800 text-sm"
                  title="Clone event"
                >
                  Clone
                </button>
              )}
              {onEditEvent && (
                <button
                  onClick={() => {
                    console.log('[CalendarListView] Edit clicked:', event.id, event);
                    onEditEvent(event);
                  }}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                  title="Edit event"
                >
                  Edit
                </button>
              )}
              {onDeleteEvent && (
                <button
                  onClick={() => onDeleteEvent(event.id)}
                  className="text-red-600 hover:text-red-800 text-sm"
                  title="Delete event"
                >
                  Delete
                </button>
              )}
              {process.env.NEXT_PUBLIC_ENABLE_TRAINING_LOG_UI === 'true' && onLogTraining && ['practice', 'gym', 'education'].includes(event.activity_type) && (
                <button
                  onClick={() => onLogTraining(event)}
                  className="text-yellow-600 hover:text-yellow-800 text-sm"
                  title="Log training session"
                >
                  📋 Log
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}