"use client";

import { useState, useEffect } from "react";
import CalendarEventForm from "./CalendarEventForm";
import CalendarGridView from "./CalendarGridView";
import CalendarListView from "./CalendarListView";
import MobileCoachView from "./MobileCoachView";
import RescheduleModal from "./RescheduleModal";
import ParentRequestForm from "./ParentRequestForm";
import { useRoleAccess } from "@/contexts/UserContext";

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

// Enhanced mobile detection for coach-first experience
const isMobileDevice = () => {
  if (typeof window === 'undefined') return { isMobile: false, forceList: false };
  
  const width = window.innerWidth;
  const touch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const userAgent = navigator.userAgent.toLowerCase();
  const isMobileUA = /iphone|ipod|android|blackberry|windows phone/.test(userAgent);
  const isTablet = /ipad|android(?!.*mobile)|tablet/.test(userAgent);
  
  // Phone: Always use list view (coaches on court)
  if (width < 768 && (touch || isMobileUA)) {
    return { isMobile: true, forceList: true, device: 'phone' };
  }
  
  // Small tablet portrait: Prefer list but allow switching
  if (width < 1024 && isTablet) {
    return { isMobile: true, forceList: false, device: 'tablet' };
  }
  
  // Desktop or large tablet: Calendar view optimal
  return { isMobile: false, forceList: false, device: 'desktop' };
};

export default function CalendarView() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [reschedulingEvent, setReschedulingEvent] = useState<CalendarEvent | null>(null);
  const [showParentRequestForm, setShowParentRequestForm] = useState(false);
  
  // Get user role and permissions
  const { 
    isCoach, 
    isParent, 
    isPlayer, 
    showCreateButton, 
    showEditControls,
    canModifyEvent 
  } = useRoleAccess();
  
  // View mode with coach-first mobile detection
  const deviceInfo = isMobileDevice();
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>(() => {
    if (typeof window === 'undefined') return 'list';
    
    // On phones, always default to list (coaches on court need mobile week view)
    if (deviceInfo.forceList) return 'list';
    
    // Otherwise check saved preference
    const saved = localStorage.getItem('calendarView') as 'calendar' | 'list';
    if (saved) return saved;
    
    // NEW: Coaches default to week view (MobileCoachView/List), others to calendar
    if (isCoach) {
      return 'list'; // MobileCoachView provides week view for coaches
    }
    
    // Default: list for mobile, calendar for desktop
    return deviceInfo.isMobile ? 'list' : 'calendar';
  });
  
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  // Auto-switch to list on phones, warn on tablets
  useEffect(() => {
    const checkUsability = () => {
      const check = isMobileDevice();
      
      // Force list view on phones
      if (check.forceList && viewMode === 'calendar') {
        setViewMode('list');
        setMessage('📱 List view optimized for mobile coaching');
        setTimeout(() => setMessage(null), 3000);
      }
    };
    
    window.addEventListener('resize', checkUsability);
    checkUsability(); // Check on mount
    return () => window.removeEventListener('resize', checkUsability);
  }, [viewMode]);

  const handleViewChange = (view: 'calendar' | 'list') => {
    const device = isMobileDevice();
    
    // Warn if selecting calendar on phone
    if (view === 'calendar' && device.forceList) {
      setMessage('📱 Calendar view not optimized for phones - use List view');
      setTimeout(() => setMessage(null), 4000);
      return; // Don't switch
    }
    
    setViewMode(view);
    localStorage.setItem('calendarView', view);
    setMessage(null);
    
    // Analytics tracking
    console.log(`[Analytics] View: ${view}, Device: ${device.device}`);
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

  // Handle mobile reschedule with optimized modal
  const handleRescheduleEvent = (event: CalendarEvent) => {
    setReschedulingEvent(event);
  };

  const handleRescheduleSubmit = async (data: { start_time: string; end_time: string }) => {
    if (!reschedulingEvent) return;
    
    try {
      const response = await fetch(`/api/calendar/events/${reschedulingEvent.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...reschedulingEvent,
          start_time: data.start_time,
          end_time: data.end_time,
        }),
      });
      if (!response.ok) throw new Error("Failed to reschedule event");
      setReschedulingEvent(null);
      fetchEvents();
      setMessage('✅ Event rescheduled successfully');
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to reschedule event");
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

  // Handle parent request submission
  const handleParentRequest = async (data: any) => {
    try {
      const response = await fetch("/api/calendar/parent-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      
      setShowParentRequestForm(false);
      fetchEvents(); // Refresh events to show the new request
      setMessage(result.message);
      setTimeout(() => setMessage(null), 5000);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to submit request");
    }
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

  if (loading) return <div className="p-4">Loading calendar...</div>;
  if (error) return <div className="p-4 text-red-600">Error: {error}</div>;

  return (
    <div className="p-4">
      <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">
            {isCoach && "Team Calendar"}
            {isParent && "📅 My Child's Schedule"}
            {isPlayer && "📅 My Tennis Schedule"}
          </h2>
          {(isParent || isPlayer) && (
            <p className="text-sm text-gray-600 mt-1">
              {isParent && "View-only schedule with RSVP options"}
              {isPlayer && "Your personal training and match schedule"}
            </p>
          )}
        </div>
        
        <div className="flex items-center gap-2 sm:gap-4">
          {/* View Toggle - Hide calendar option on phones, show only for coaches and tablets+ */}
          {!deviceInfo.forceList && isCoach && (
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => handleViewChange('calendar')}
                className={`px-3 sm:px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'calendar' 
                    ? 'bg-white shadow text-blue-600' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                📅 Calendar
              </button>
              <button
                onClick={() => handleViewChange('list')}
                className={`px-3 sm:px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-white shadow text-blue-600' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                📋 List
              </button>
            </div>
          )}
          
          {/* Role-based action buttons */}
          {showCreateButton && isCoach && (
            <button
              onClick={() => {
                setEditingEvent(null);
                setShowForm(true);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Add Event
            </button>
          )}
          
          {isParent && (
            <button
              onClick={() => setShowParentRequestForm(true)}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Request Time
            </button>
          )}
          
          {isPlayer && (
            <button
              onClick={() => {
                // TODO: Open sparring request form
                alert("Sparring request system coming soon!");
              }}
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
            >
              Request Sparring
            </button>
          )}
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

      {reschedulingEvent && (
        <RescheduleModal
          event={reschedulingEvent}
          onSubmit={handleRescheduleSubmit}
          onCancel={() => setReschedulingEvent(null)}
        />
      )}

      {showParentRequestForm && (
        <ParentRequestForm
          onSubmit={handleParentRequest}
          onCancel={() => setShowParentRequestForm(false)}
        />
      )}

      {/* Render appropriate view based on device and selection */}
      {viewMode === 'calendar' && isCoach ? (
        <CalendarGridView
          events={events}
          loading={loading}
          onSelectEvent={handleSelectEvent}
          onSelectSlot={handleSelectSlot}
        />
      ) : (
        // Use mobile-optimized view for phones, standard list for tablets/desktop
        deviceInfo.isMobile && deviceInfo.device === 'phone' ? (
          <MobileCoachView
            events={events}
            loading={loading}
            onEditEvent={showEditControls ? (event) => {
              setEditingEvent(event);
              setShowForm(true);
            } : undefined}
            onDeleteEvent={showEditControls ? handleDeleteEvent : undefined}
            onCloneEvent={showEditControls ? handleCloneEvent : undefined}
            onRescheduleEvent={showEditControls ? handleRescheduleEvent : undefined}
            onCreateEvent={showCreateButton ? () => {
              setEditingEvent(null);
              setShowForm(true);
            } : undefined}
            userRole={isCoach ? 'coach' : isParent ? 'parent' : 'player'}
          />
        ) : (
          <CalendarListView
            events={events}
            loading={loading}
            onEditEvent={showEditControls ? (event) => {
              setEditingEvent(event);
              setShowForm(true);
            } : undefined}
            onDeleteEvent={showEditControls ? handleDeleteEvent : undefined}
            onCloneEvent={showEditControls ? handleCloneEvent : undefined}
            onCreateEvent={showCreateButton ? () => {
              setEditingEvent(null);
              setShowForm(true);
            } : undefined}
          />
        )
      )}
    </div>
  );
}