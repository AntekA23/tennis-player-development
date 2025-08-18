"use client";

import { useState, useEffect } from "react";
import CalendarEventForm from "./CalendarEventForm";
import CalendarGridView from "./CalendarGridView";
import CalendarListView from "./CalendarListView";
import MobileCoachView from "./MobileCoachView";
import RescheduleModal from "./RescheduleModal";
import ParentRequestForm from "./ParentRequestForm";
import SparringRequestForm from "./SparringRequestForm";
import SparringQuickAddModal from "./SparringQuickAddModal";
import TrainingLogForm from "./TrainingLogForm";
import { useRoleAccess } from "@/contexts/UserContext";
import { Role, getAllowedActivities, canCreateActivity } from '@/lib/ui/permissions';

interface CalendarEvent {
  id: number;
  title: string;
  description: string | null;
  activity_type: "practice" | "gym" | "match" | "tournament" | "education" | "sparring_request";
  start_time: string;
  end_time: string;
  location: string | null;
  created_by: number;
  participants?: Array<{
    user_id: number;
    email: string;
    role: string;
  }>;
}

// Display label mapping helper
const getDisplayActivityType = (type: CalendarEvent["activity_type"]) => {
  return type === 'sparring_request' ? 'sparring' : type;
};

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
  // UI1 bundle probe
  if (typeof window !== 'undefined') {
    console.log('UI1 bundle loaded - PR-UI1 with canonical scope + sparring passthrough');
  }
  
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [reschedulingEvent, setReschedulingEvent] = useState<CalendarEvent | null>(null);
  const [showParentRequestForm, setShowParentRequestForm] = useState(false);
  const [showSparringRequestForm, setShowSparringRequestForm] = useState(false);
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [prefill, setPrefill] = useState<{ date: string; time: string } | null>(null);
  const [showTrainingLogForm, setShowTrainingLogForm] = useState(false);
  const [trainingLogEvent, setTrainingLogEvent] = useState<CalendarEvent | null>(null);
  
  // Get user role and permissions (no fallbacks)
  const { 
    isCoach, 
    isParent, 
    isPlayer, 
    showCreateButton, 
    showEditControls,
    canModifyEvent,
    permissions
  } = useRoleAccess();
  
  const userRole = permissions?.role;
  
  // Simple same-team permission check (SONIQ spec)
  const canEditDelete = true; // Simplified: any team member can edit/delete (backend enforces team validation)
  
  console.log("[CalendarView] Roles:", { isCoach, isParent, isPlayer, showCreateButton });
  console.log("[CalendarView] Permissions:", { canEditDelete, showEditControls, canModifyEvent });
  
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
    if (userRole === 'coach') {
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
      console.log("[CalendarView] Fetched events:", data.events);
      setEvents(data.events || []);
    } catch (err) {
      console.error("[CalendarView] Error fetching events:", err);
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
        body: JSON.stringify({
          ...data,
          participantUserIds: data.participants?.map((p: any) => p.user_id),
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create event");
      }
      
      setShowForm(false);
      fetchEvents();
      setMessage('✅ Event created successfully');
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      console.error('[CalendarView] Create event error:', err);
      alert(err instanceof Error ? err.message : "Failed to create event");
    }
  };

  const handleUpdateEvent = async (data: any) => {
    if (!editingEvent) return;
    try {
      const response = await fetch(`/api/calendar/events/${editingEvent.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: data.title,
          description: data.description,
          location: data.location,
          start_time: data.start_time,
          end_time: data.end_time,
          type: data.activity_type,
          participantUserIds: data.participants?.map((p: any) => p.user_id),
          tournamentScope: data.tournamentScope,
          endTouched: data.endTouched,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update event");
      }
      
      setEditingEvent(null);
      setShowForm(false);
      fetchEvents();
      setMessage('✅ Event updated successfully');
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update event");
    }
  };

  const handleDeleteEvent = async (id: number) => {
    if (!window.confirm("Delete this event?")) return;
    console.info('[calendar] delete', { id });
    try {
      const response = await fetch(`/api/calendar/events/${id}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete event");
      }
      
      fetchEvents();
      setMessage('✅ Event deleted successfully');
      setTimeout(() => setMessage(null), 3000);
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

  // Unified event selection handler
  const onSelectEvent = (event: CalendarEvent) => {
    console.info('[calendar] edit', { id: event.id });
    setEditingEvent(event);
    setShowForm(true);
  };

  // Handle calendar grid event click (unwrap .resource)
  const handleSelectEvent = (event: any) => {
    onSelectEvent(event.resource);
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

  // Handle sparring request submission
  const handleSparringRequest = async (data: any) => {
    try {
      const response = await fetch("/api/calendar/sparring-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      
      setShowSparringRequestForm(false);
      fetchEvents(); // Refresh events to show the new request
      setMessage(result.message);
      setTimeout(() => setMessage(null), 5000);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to submit sparring request");
    }
  };

  // Handle sparring approval
  const handleApproveSparring = async (eventId: number) => {
    if (!confirm("Approve this sparring request?")) return;
    try {
      const response = await fetch(`/api/calendar/sparring-requests/${eventId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "approve" }),
      });
      
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      
      fetchEvents(); // Refresh to show updated status
      setMessage(result.message);
      setTimeout(() => setMessage(null), 5000);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to approve sparring request");
    }
  };

  // Handle sparring decline
  const handleDeclineSparring = async (eventId: number) => {
    if (!confirm("Decline this sparring request?")) return;
    try {
      const response = await fetch(`/api/calendar/sparring-requests/${eventId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "decline" }),
      });
      
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      
      fetchEvents(); // Refresh to show updated status
      setMessage(result.message);
      setTimeout(() => setMessage(null), 5000);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to decline sparring request");
    }
  };

  const handleLogTraining = async (event: CalendarEvent) => {
    try {
      // Fetch participants for this event
      const response = await fetch(`/api/calendar/events/${event.id}`, {
        credentials: 'include',
      });
      
      if (response.ok) {
        const eventData = await response.json();
        // Store participants with the event for the form
        setTrainingLogEvent({
          ...event,
          participants: eventData.participants || []
        });
        setShowTrainingLogForm(true);
      } else {
        setMessage('Failed to load event participants');
      }
    } catch (error) {
      console.error('Error fetching event participants:', error);
      setMessage('Failed to load event participants');
    }
  };

  const handleTrainingLogSubmit = async (data: any) => {
    try {
      setMessage('Training log saved successfully!');
      setShowTrainingLogForm(false);
      setTrainingLogEvent(null);
      fetchEvents(); // Refresh to show any updates
    } catch (error) {
      console.error('Error saving training log:', error);
      setMessage('Failed to save training log');
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
            {userRole === 'coach' && "Team Calendar"}
            {userRole === 'parent' && "📅 My Child's Schedule"}
            {userRole === 'player' && "📅 My Tennis Schedule"}
            {!userRole && "📅 Calendar"}
          </h2>
          {userRole && (
            <p className="text-sm text-gray-600 mt-1">
              {userRole === 'parent' && "View-only schedule with RSVP options"}
              {userRole === 'player' && "Your personal training and match schedule"}
              {userRole === 'coach' && "Manage team events and schedules"}
            </p>
          )}
        </div>
        
        <div className="flex items-center gap-2 sm:gap-4">
          {/* View Toggle - Available for all users */}
          {
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
          }
          
          {/* Role-based action buttons */}
          {userRole && showCreateButton && (
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
          
          {userRole === 'parent' && (
            <button
              onClick={() => setShowParentRequestForm(true)}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Request Time
            </button>
          )}
          
          
          {/* Quick Add Sparring - Only for users who can create sparring */}
          {userRole && canCreateActivity(userRole, 'sparring') && (
            <button
              onClick={() => {
                // TODO: Use proper date source from calendar view when available
                const today = new Date();
                const dateStr = today.toISOString().split('T')[0]; // YYYY-MM-DD
                const timeStr = '18:00'; // Default to 6 PM
                setPrefill({ date: dateStr, time: timeStr });
                setQuickAddOpen(true);
              }}
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
            >
              Quick Add Sparring
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

      {showSparringRequestForm && (
        <SparringRequestForm
          onSubmit={handleSparringRequest}
          onCancel={() => setShowSparringRequestForm(false)}
        />
      )}

      <SparringQuickAddModal
        open={quickAddOpen}
        onClose={() => setQuickAddOpen(false)}
        initialDate={prefill?.date}
        initialTime={prefill?.time}
        onConfirm={async (payload) => {
          try {
            // Convert date and time to UTC ISO string
            const startDate = new Date(`${payload.date}T${payload.time}:00`);
            const endDate = new Date(startDate.getTime() + 90 * 60 * 1000); // 90 minutes default
            
            const response = await fetch('/api/calendar/sparring/quick-add', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                title: payload.notes ? `Sparring - ${payload.notes}` : 'Sparring',
                notes: payload.notes,
                startISO: startDate.toISOString(),
                endISO: endDate.toISOString(),
                location: payload.location,
              }),
            });
            
            if (!response.ok) {
              const err = await response.json().catch(() => ({}));
              throw new Error(err?.error || 'Request failed');
            }
            
            const result = await response.json();
            console.log('[quick-add-sparring] Created event', result.id);
            setQuickAddOpen(false);
            fetchEvents(); // Refresh calendar
            setMessage('Sparring session added successfully');
            setTimeout(() => setMessage(null), 3000);
          } catch (error) {
            console.error('Quick add error:', error);
            alert('Failed to add sparring session');
          }
        }}
      />

      {/* Conditional render logic - Calendar or List */}
      
      {viewMode === 'calendar' && events.length > 0 ? (
        <CalendarGridView
          events={events}
          loading={loading}
          onSelectEvent={handleSelectEvent}
          onSelectSlot={handleSelectSlot}
          onEditEvent={canEditDelete ? onSelectEvent : undefined}
          onDeleteEvent={canEditDelete ? handleDeleteEvent : undefined}
        />
      ) : events.length > 0 ? (
        <CalendarListView
          events={events}
          loading={loading}
          onEditEvent={canEditDelete ? onSelectEvent : undefined}
          onDeleteEvent={canEditDelete ? handleDeleteEvent : undefined}
          onCloneEvent={showEditControls ? handleCloneEvent : undefined}
          onCreateEvent={showCreateButton ? () => {
            setEditingEvent(null);
            setShowForm(true);
          } : undefined}
          onLogTraining={handleLogTraining}
        />
      ) : (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <div className="text-gray-500">
            <div className="text-6xl mb-4">📅</div>
            <h3 className="text-lg font-medium mb-2">No events scheduled</h3>
            <p className="text-sm mb-4">No events to display</p>
            <div className="text-xs text-gray-400">
              Debug: {events.length} events loaded
            </div>
          </div>
        </div>
      )}

      {/* Training Log Form Modal */}
      {process.env.NEXT_PUBLIC_ENABLE_TRAINING_LOG_UI === 'true' && showTrainingLogForm && trainingLogEvent && (
        <TrainingLogForm
          eventId={trainingLogEvent.id}
          participants={trainingLogEvent.participants || []}
          onSubmit={handleTrainingLogSubmit}
          onCancel={() => {
            setShowTrainingLogForm(false);
            setTrainingLogEvent(null);
          }}
        />
      )}
    </div>
  );
}