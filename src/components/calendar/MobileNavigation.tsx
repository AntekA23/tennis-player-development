"use client";

import React from 'react';

interface MobileNavigationProps {
  weekOffset: number;
  onWeekChange: (offset: number) => void;
  onToday: () => void;
  onCreateEvent?: () => void;
  activeFilters: string[];
  onFilterChange: (filters: string[]) => void;
  weekStart: Date;
  weekEnd: Date;
}

const getActivityEmoji = (type: string) => {
  const emojis: { [key: string]: string } = {
    practice: "🎾",
    gym: "💪",
    match: "🏆",
    tournament: "🏅",
    education: "📚",
  };
  return emojis[type];
};

export default function MobileNavigation({
  weekOffset,
  onWeekChange,
  onToday,
  onCreateEvent,
  activeFilters,
  onFilterChange,
  weekStart,
  weekEnd,
}: MobileNavigationProps) {
  const toggleFilter = (type: string) => {
    const newFilters = activeFilters.includes(type) 
      ? activeFilters.filter(f => f !== type)
      : [...activeFilters, type];
    onFilterChange(newFilters);
  };

  return (
    <div className="sticky top-0 bg-white z-10 pb-4 -mx-4 px-4 pt-2 shadow-sm">
      {/* Week Navigation */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => onWeekChange(weekOffset - 1)}
          className="p-2 hover:bg-gray-100 rounded-lg"
          aria-label="Previous week"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <div className="text-center">
          <div className="text-sm text-gray-600">
            Week {weekOffset === 0 ? '(Current)' : weekOffset > 0 ? `+${weekOffset}` : weekOffset}
          </div>
          <div className="font-semibold">
            {weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - 
            {weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </div>
        </div>
        
        <button
          onClick={() => onWeekChange(weekOffset + 1)}
          className="p-2 hover:bg-gray-100 rounded-lg"
          aria-label="Next week"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
      
      {/* Quick Actions Bar */}
      <div className="flex gap-2 mb-3">
        <button
          onClick={onToday}
          className={`flex-1 py-3 px-4 rounded-lg font-semibold text-white transition-colors ${
            weekOffset === 0 ? 'bg-blue-600' : 'bg-gray-400 hover:bg-gray-500'
          }`}
        >
          TODAY
        </button>
        
        {onCreateEvent && (
          <button
            onClick={onCreateEvent}
            className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add
          </button>
        )}
      </div>
      
      {/* Filter Chips */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => onFilterChange([])}
          className={`px-4 py-2 rounded-full whitespace-nowrap font-medium transition-colors ${
            activeFilters.length === 0
              ? 'bg-gray-800 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All Events
        </button>
        
        {(['practice', 'gym', 'match', 'tournament', 'education'] as const).map(type => (
          <button
            key={type}
            onClick={() => toggleFilter(type)}
            className={`px-4 py-2 rounded-full whitespace-nowrap font-medium transition-colors flex items-center gap-2 ${
              activeFilters.includes(type)
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <span>{getActivityEmoji(type)}</span>
            <span className="capitalize">{type}</span>
          </button>
        ))}
      </div>
    </div>
  );
}