"use client";

import React from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

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

interface CalendarGridViewProps {
  events: CalendarEvent[];
  loading: boolean;
  onSelectEvent: (event: any) => void;
  onSelectSlot: (slotInfo: any) => void;
}

const localizer = momentLocalizer(moment);

// Activity colors with accessibility patterns
const eventStyleGetter = (event: any) => {
  const styles = {
    practice: { 
      backgroundColor: '#3B82F6', 
      border: '2px solid #1E40AF',
      color: 'white'
    },
    gym: { 
      backgroundColor: '#10B981', 
      border: '2px dashed #047857',
      color: 'white'
    },
    match: { 
      backgroundColor: '#F59E0B', 
      border: '2px dotted #D97706',
      color: 'white'
    },
    tournament: { 
      backgroundColor: '#8B5CF6', 
      border: '2px solid #6D28D9',
      color: 'white'
    },
    education: { 
      backgroundColor: '#6B7280', 
      border: '2px dashed #374151',
      color: 'white'
    }
  };
  
  const activity = event.resource?.activity_type || 'practice';
  return { 
    style: {
      ...styles[activity as keyof typeof styles],
      borderRadius: '4px',
      fontSize: '12px',
      fontWeight: '500'
    }
  };
};

// Format event time with timezone
const formatEventTime = (date: Date) => {
  return moment(date).format('h:mm A z');
};

// Timezone notice component
const TimezoneNotice = () => (
  <div className="text-sm text-gray-600 mb-2">
    Times shown in your local timezone
    {/* TODO: Add timezone selector here */}
  </div>
);

// Empty state component
const EmptyCalendar = ({ onCreateEvent }: { onCreateEvent: () => void }) => (
  <div className="text-center py-12 bg-gray-50 rounded-lg">
    <div className="text-4xl mb-4">📅</div>
    <h3 className="text-lg font-semibold mb-2">No events scheduled</h3>
    <p className="text-gray-600 mb-4">Click on any date to create your first event</p>
    <button 
      onClick={onCreateEvent}
      className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
    >
      Create First Event
    </button>
  </div>
);

export default function CalendarGridView({ 
  events, 
  loading, 
  onSelectEvent, 
  onSelectSlot 
}: CalendarGridViewProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
        <span className="ml-3">Loading calendar...</span>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <EmptyCalendar 
        onCreateEvent={() => onSelectSlot({ start: new Date(), end: new Date() })}
      />
    );
  }

  // Convert events to calendar format
  const calendarEvents = events.map((event) => ({
    id: event.id,
    title: event.title,
    start: new Date(event.start_time),
    end: new Date(event.end_time),
    resource: event
  }));

  return (
    <div>
      <TimezoneNotice />
      <div 
        className="calendar-container" 
        role="application"
        aria-label="Team calendar"
      >
        <Calendar
          localizer={localizer}
          events={calendarEvents}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 600 }}
          onSelectEvent={onSelectEvent}
          onSelectSlot={onSelectSlot}
          selectable
          eventPropGetter={eventStyleGetter}
          views={['month', 'week', 'day']}
          defaultView="month"
          popup
          showMultiDayTimes
          step={30}
          timeslots={2}
          messages={{
            next: "Next",
            previous: "Previous",
            today: "Today",
            month: "Month",
            week: "Week",
            day: "Day"
          }}
        />
      </div>

      {/* Custom styles for accessibility */}
      <style jsx>{`
        .calendar-container .rbc-event {
          min-height: 20px;
          padding: 2px 4px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;
        }
        
        .calendar-container .rbc-event:focus {
          outline: 2px solid #2563EB;
          outline-offset: 2px;
        }
        
        .calendar-container .rbc-day-slot .rbc-time-slot {
          border-bottom: 1px solid #E5E7EB;
        }
        
        .calendar-container .rbc-today {
          background-color: #EFF6FF;
        }
        
        .calendar-container .rbc-toolbar button {
          padding: 8px 12px;
          border-radius: 6px;
          border: 1px solid #D1D5DB;
          background: white;
          margin: 0 2px;
        }
        
        .calendar-container .rbc-toolbar button:hover {
          background-color: #F3F4F6;
        }
        
        .calendar-container .rbc-toolbar button.rbc-active {
          background-color: #3B82F6;
          color: white;
          border-color: #2563EB;
        }
      `}</style>
    </div>
  );
}