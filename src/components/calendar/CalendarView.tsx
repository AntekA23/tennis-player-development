"use client";

import { useState, useEffect } from "react";
import CalendarEventForm from "./CalendarEventForm";
import CalendarGridView from "./CalendarGridView";
import CalendarListView from "./CalendarListView";

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

// Mobile detection with usability check
const isMobileDevice = () => {
  if (typeof window === 'undefined') return { useList: false };
  const width = window.innerWidth;
  const touch = 'ontouchstart' in window;
  
  // If screen too small for useful calendar, force list
  if (width < 500) return { useList: true, reason: 'screen_too_small' };
  if (width < 768 && touch) return { useList: true, reason: 'mobile_touch' };
  return { useList: false };
};

export default function CalendarView() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  
  // View mode with mobile detection
  const mobileCheck = isMobileDevice();
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>(() => {
    if (typeof window === 'undefined') return 'calendar';
    const saved = localStorage.getItem('calendarView') as 'calendar' | 'list';
    return saved || (mobileCheck.useList ? 'list' : 'calendar');
  });
  
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  // Auto-switch to list if calendar becomes unusable on resize
  useEffect(() => {
    const checkUsability = () => {
      const check = isMobileDevice();
      if (check.useList && viewMode === 'calendar') {
        setViewMode('list');
        setMessage(`Switched to list view: better for mobile`);
        setTimeout(() => setMessage(null), 3000);
      }
    };
    
    window.addEventListener('resize', checkUsability);
    return () => window.removeEventListener('resize', checkUsability);
  }, [viewMode]);

  const handleViewChange = (view: 'calendar' | 'list') => {
    setViewMode(view);
    localStorage.setItem('calendarView', view);
    setMessage(null);
    
    // Analytics tracking for future decisions
    console.log(`[Analytics] View selected: ${view}, Mobile: ${isMobileDevice().useList}`);
  };

  const fetchEvents = async () => {
    try {
      const response = await fetch("/api/calendar/events");
      if (!response.ok) throw new Error("Failed to fetch events");
      const data = await response.json();
      setEvents(data.events || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async (data: any) => {
    try {
      const response = await fetch("/api/calendar/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create event");
      setShowForm(false);
      fetchEvents();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to create event");
    }
  };

  const handleUpdateEvent = async (data: any) => {
    if (!editingEvent) return;
    try {
      const response = await fetch(`/api/calendar/events/${editingEvent.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to update event");
      setEditingEvent(null);
      setShowForm(false);
      fetchEvents();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update event");
    }
  };

  const handleDeleteEvent = async (id: number) => {
    if (!confirm("Are you sure you want to delete this event?")) return;
    try {
      const response = await fetch(`/api/calendar/events/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete event");
      fetchEvents();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete event");
    }
  };

  const handleCloneEvent = async (event: CalendarEvent) => {
    try {
      // Clone with same times for now (future: could prompt for new dates)
      const response = await fetch(`/api/calendar/events/${event.id}/clone`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          start_time: event.start_time,
          end_time: event.end_time,
        }),
      });
      if (!response.ok) throw new Error("Failed to clone event");
      fetchEvents();
      alert("Event cloned successfully!");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to clone event");
    }
  };

  // Handle calendar date/time selection
  const handleSelectSlot = (slotInfo: any) => {
    const defaultDuration = 2; // hours
    const endTime = new Date(slotInfo.start.getTime() + defaultDuration * 60 * 60 * 1000);
    
    setEditingEvent({
      id: 0,
      title: '',
      description: '',
      activity_type: 'practice',
      start_time: slotInfo.start.toISOString(),
      end_time: endTime.toISOString(),
      location: '',
      created_by: 0
    });
    setShowForm(true);
  };

  // Handle calendar event click
  const handleSelectEvent = (event: any) => {
    setEditingEvent(event.resource);
    setShowForm(true);
  };

  const getActivityColor = (type: CalendarEvent["activity_type"]) => {
    const colors = {
      practice: "bg-blue-100 text-blue-800",
      gym: "bg-green-100 text-green-800",
      match: "bg-red-100 text-red-800",
      tournament: "bg-purple-100 text-purple-800",
      education: "bg-yellow-100 text-yellow-800",
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

  if (loading) return <div className="p-4">Loading calendar...</div>;
  if (error) return <div className="p-4 text-red-600">Error: {error}</div>;

  return (
    <div className="p-4">
      <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold">Team Calendar</h2>
        
        <div className="flex items-center gap-4">
          {/* View Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => handleViewChange('calendar')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'calendar' 
                  ? 'bg-white shadow text-blue-600' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              📅 Calendar
            </button>
            <button
              onClick={() => handleViewChange('list')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'list' 
                  ? 'bg-white shadow text-blue-600' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              📋 List
            </button>
          </div>
          
          {/* Add Event Button */}
          <button
            onClick={() => {
              setEditingEvent(null);
              setShowForm(true);
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Add Event
          </button>
        </div>
      </div>

      {/* Message Display */}
      {message && (
        <div className="mb-4 bg-blue-50 border border-blue-200 text-blue-700 px-4 py-2 rounded-md">
          {message}
        </div>
      )}

      {showForm && (
        <CalendarEventForm
          initialData={editingEvent}
          onSubmit={editingEvent ? handleUpdateEvent : handleCreateEvent}
          onCancel={() => {
            setShowForm(false);
            setEditingEvent(null);
          }}
        />
      )}

      {/* Render appropriate view */}
      {viewMode === 'calendar' ? (
        <CalendarGridView
          events={events}
          loading={loading}
          onSelectEvent={handleSelectEvent}
          onSelectSlot={handleSelectSlot}
        />
      ) : (
        <CalendarListView
          events={events}
          loading={loading}
          onEditEvent={(event) => {
            setEditingEvent(event);
            setShowForm(true);
          }}
          onDeleteEvent={handleDeleteEvent}
          onCloneEvent={handleCloneEvent}
          onCreateEvent={() => {
            setEditingEvent(null);
            setShowForm(true);
          }}
        />
      )}
    </div>
  );
}