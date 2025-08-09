"use client";

import React, { useState, useEffect } from 'react';
import MobileNavigation from './MobileNavigation';
import MobileEventCard from './MobileEventCard';

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

interface MobileCoachViewProps {
  events: CalendarEvent[];
  loading: boolean;
  onEditEvent?: (event: CalendarEvent) => void;
  onDeleteEvent?: (id: number) => void;
  onCloneEvent?: (event: CalendarEvent) => void;
  onCreateEvent?: () => void;
  onRescheduleEvent?: (event: CalendarEvent) => void;
  userRole?: 'coach' | 'parent' | 'player';
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  if (date.toDateString() === today.toDateString()) {
    return "Today";
  } else if (date.toDateString() === tomorrow.toDateString()) {
    return "Tomorrow";
  }
  
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
};

// Group events by date
const groupEventsByDate = (events: CalendarEvent[]) => {
  const grouped: { [key: string]: CalendarEvent[] } = {};
  
  events.forEach(event => {
    const dateKey = new Date(event.start_time).toDateString();
    if (!grouped[dateKey]) {
      grouped[dateKey] = [];
    }
    grouped[dateKey].push(event);
  });
  
  // Sort dates
  return Object.entries(grouped).sort(([a], [b]) => 
    new Date(a).getTime() - new Date(b).getTime()
  );
};

export default function MobileCoachView({
  events,
  loading,
  onEditEvent,
  onDeleteEvent,
  onCloneEvent,
  onCreateEvent,
  onRescheduleEvent,
  userRole = 'coach',
}: MobileCoachViewProps) {
  const [expandedCard, setExpandedCard] = useState<number | null>(null);
  const [weekOffset, setWeekOffset] = useState(0);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<number | null>(null);
  const [teamPlayers, setTeamPlayers] = useState<Array<{id: number; name: string}>>([]);
  
  // Calculate current week dates
  const getWeekDates = (offset: number = 0) => {
    const today = new Date();
    const currentDay = today.getDay();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - currentDay + (offset * 7));
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    
    return { start: weekStart, end: weekEnd };
  };
  
  const { start: weekStart, end: weekEnd } = getWeekDates(weekOffset);
  
  // Load team players for coaches
  useEffect(() => {
    const fetchTeamPlayers = async () => {
      if (userRole === 'coach') {
        try {
          const response = await fetch('/api/teams/details');
          if (response.ok) {
            const data = await response.json();
            // Extract players from team members
            const players = data.members
              ?.filter((member: any) => member.role === 'player')
              .map((member: any) => ({
                id: member.user_id,
                name: member.user?.email || `Player ${member.user_id}` // Fallback name
              }));
            setTeamPlayers(players || []);
          }
        } catch (error) {
          console.error('Failed to load team players:', error);
        }
      }
    };
    
    fetchTeamPlayers();
  }, [userRole]);
  
  // Filter events for current week view, activity type, and player
  const filteredEvents = events.filter(event => {
    const eventDate = new Date(event.start_time);
    const inWeek = eventDate >= weekStart && eventDate <= weekEnd;
    const matchesFilter = activeFilters.length === 0 || activeFilters.includes(event.activity_type);
    
    // Player filter (only for coaches)
    let matchesPlayer = true;
    if (userRole === 'coach' && selectedPlayer) {
      // This would need event participants API to work fully
      // For now, we'll show all events when a player is selected
      // TODO: Implement proper player-event filtering with participants API
      matchesPlayer = true;
    }
    
    return inWeek && matchesFilter && matchesPlayer;
  });
  
  const handleToday = () => {
    setWeekOffset(0);
    // Scroll to today's events
    const todaySection = document.getElementById('today-events');
    if (todaySection) {
      todaySection.scrollIntoView({ behavior: 'smooth' });
    }
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
        <span className="ml-3">Loading schedule...</span>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📋</div>
        <h3 className="text-xl font-semibold mb-2">No events scheduled</h3>
        <p className="text-gray-600 mb-6">Start building your team schedule</p>
        <button
          onClick={onCreateEvent}
          className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-medium"
        >
          Create First Event
        </button>
      </div>
    );
  }

  const groupedEvents = groupEventsByDate(filteredEvents);

  return (
    <div className="space-y-4">
      <MobileNavigation
        weekOffset={weekOffset}
        onWeekChange={setWeekOffset}
        onToday={handleToday}
        onCreateEvent={onCreateEvent}
        activeFilters={activeFilters}
        onFilterChange={setActiveFilters}
        weekStart={weekStart}
        weekEnd={weekEnd}
        userRole={userRole}
        selectedPlayer={selectedPlayer}
        onPlayerFilterChange={setSelectedPlayer}
        teamPlayers={teamPlayers}
      />
      
      {/* Stats Summary */}
      <div className="bg-gray-50 rounded-lg p-3 flex justify-between items-center">
        <div className="text-sm">
          <span className="font-semibold">{filteredEvents.length}</span> events this week
        </div>
        <div className="text-sm text-gray-600">
          {filteredEvents.filter(e => 
            new Date(e.start_time).toDateString() === new Date().toDateString()
          ).length} today
        </div>
      </div>

      {/* Events grouped by date */}
      {groupedEvents.map(([dateKey, dateEvents]) => {
        const isToday = new Date(dateKey).toDateString() === new Date().toDateString();
        return (
          <div key={dateKey} id={isToday ? 'today-events' : undefined}>
            <h3 className="text-lg font-semibold mb-3 text-gray-700 flex items-center gap-2">
              {formatDate(dateEvents[0].start_time)}
              {isToday && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">TODAY</span>}
            </h3>
          
            <div className="space-y-3">
              {dateEvents.map((event) => (
                <MobileEventCard
                  key={event.id}
                  event={event}
                  isExpanded={expandedCard === event.id}
                  onToggleExpand={() => setExpandedCard(expandedCard === event.id ? null : event.id)}
                  onReschedule={onRescheduleEvent ? () => onRescheduleEvent(event) : undefined}
                  onClone={onCloneEvent ? () => onCloneEvent(event) : undefined}
                  onEdit={onEditEvent ? () => onEditEvent(event) : undefined}
                  onDelete={onDeleteEvent ? () => onDeleteEvent(event.id) : undefined}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}