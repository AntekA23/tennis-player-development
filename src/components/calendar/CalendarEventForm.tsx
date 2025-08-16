"use client";

import React, { useState } from "react";
import { useRoleAccess } from "@/contexts/UserContext";

interface CalendarEventFormProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
  initialData?: any;
}

// Helper function to convert ISO timestamp to datetime-local format
const formatDatetimeLocal = (isoString: string) => {
  if (!isoString) return "";
  const date = new Date(isoString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

// Local time helpers (no timezone conversion)
function parseLocal(dt: string): Date {
  // dt: "YYYY-MM-DDTHH:mm"
  const [d, t] = dt.split('T');
  const [Y, M, D] = d.split('-').map(Number);
  const [h, m] = t.split(':').map(Number);
  return new Date(Y, (M - 1), D, h, m, 0, 0); // local time
}

function formatLocal(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  const Y = d.getFullYear();
  const M = pad(d.getMonth() + 1);
  const D = pad(d.getDate());
  const h = pad(d.getHours());
  const m = pad(d.getMinutes());
  return `${Y}-${M}-${D}T${h}:${m}`;
}

function toIsoUtc(dt: string): string {
  const d = parseLocal(dt);
  return new Date(
    Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), d.getMinutes(), 0, 0)
  ).toISOString();
}

const MAX_DURATION = 12 * 60 * 60 * 1000;
const DEFAULT_DURATION = 90 * 60 * 1000;

function safeDurationMs(startStr: string, endStr: string) {
  const s = parseLocal(startStr).getTime();
  const e = parseLocal(endStr).getTime();
  const d = e - s;
  return (d > 0 && d <= MAX_DURATION) ? d : DEFAULT_DURATION;
}

interface TeamMember {
  id: number;
  user_id: number;
  role: string;
  status: string;
  user: {
    email: string;
  };
}

interface Participant {
  user_id: number;
  role: 'player' | 'coach' | 'parent';
  email: string;
}

export default function CalendarEventForm({
  onSubmit,
  onCancel,
  initialData,
}: CalendarEventFormProps) {
  const { isCoach, isParent, isPlayer, permissions } = useRoleAccess();
  
  // Get user from localStorage as fallback
  const [localUserRole, setLocalUserRole] = React.useState<string | null>(null);
  React.useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      setLocalUserRole(user.role);
      
      // Fetch team members for participant selection
      fetch(`/api/teams/details?userId=${user.id}`)
        .then(res => res.json())
        .then(data => {
          if (data.team?.members) {
            setTeamMembers(data.team.members);
          }
        })
        .catch(console.error)
        .finally(() => setLoadingMembers(false));
    }
  }, []);
  
  // Use fallback if permissions not loaded
  const isCoachFallback = isCoach || localUserRole === 'coach';
  const isParentFallback = isParent || localUserRole === 'parent';
  const isPlayerFallback = isPlayer || localUserRole === 'player';

  // Activity type role restrictions
  const getAllowedRoles = (activityType: string): string[] => {
    switch (activityType) {
      case 'education':
        return ['parent', 'player'];
      case 'practice':
      case 'gym':
        return ['player', 'coach'];
      case 'match':
      case 'sparring_request':
        return ['player'];
      case 'tournament':
        return ['parent', 'player', 'coach'];
      default:
        return ['player', 'coach'];
    }
  };

  // Filter team members based on activity type
  const getFilteredMembers = () => {
    const allowedRoles = getAllowedRoles(formData.activity_type);
    console.log('[DEBUG] Filtering members:', {
      activityType: formData.activity_type,
      allowedRoles,
      allMembers: teamMembers.map(m => ({ email: m.user.email, role: m.role, status: m.status }))
    });
    
    return teamMembers.filter(member => 
      member.status === 'accepted' && allowedRoles.includes(member.role)
    );
  };

  // Handle activity type change with participant validation
  const handleActivityTypeChange = (newType: string) => {
    const allowedRoles = getAllowedRoles(newType);
    const invalidParticipants = selectedParticipants.filter(p => !allowedRoles.includes(p.role));
    
    if (invalidParticipants.length > 0) {
      const invalidEmails = invalidParticipants.map(p => p.email).join(', ');
      if (window.confirm(`These participants aren't allowed for ${newType}: ${invalidEmails}. Remove them?`)) {
        setSelectedParticipants(prev => prev.filter(p => allowedRoles.includes(p.role)));
      } else {
        return; // Don't change activity type
      }
    }
    
    // Update activity type and recalculate end time if start time is set
    let updatedData = { ...formData, activity_type: newType };
    if (formData.start_time) {
      updatedData.end_time = calculateEndTime(formData.start_time, newType);
    }
    
    setFormData(updatedData);
  };

  // Calculate smart end time based on activity type
  const calculateEndTime = (startTime: string, activityType: string): string => {
    if (!startTime) return '';
    
    const start = parseLocal(startTime);
    let durationMs: number;
    
    switch (activityType) {
      case 'practice':
      case 'gym':
      case 'education':
        durationMs = 60 * 60 * 1000; // 60 minutes
        break;
      case 'match':
      case 'sparring_request':
        durationMs = 90 * 60 * 1000; // 90 minutes
        break;
      case 'tournament':
        durationMs = 2 * 24 * 60 * 60 * 1000; // 2 days (National default)
        break;
      default:
        durationMs = 60 * 60 * 1000; // 60 minutes default
    }
    
    const end = new Date(start.getTime() + durationMs);
    return formatLocal(end);
  };
  
  // Get default activity type based on role
  const getDefaultActivityType = () => {
    if (initialData?.activity_type) return initialData.activity_type;
    if (isParentFallback && !isCoachFallback) return "tournament";
    if (isPlayerFallback && !isCoachFallback && !isParentFallback) return "sparring_request";
    return "practice"; // coach default
  };

  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    description: initialData?.description || "",
    activity_type: getDefaultActivityType(),
    start_time: formatDatetimeLocal(initialData?.start_time || ""),
    end_time: formatDatetimeLocal(initialData?.end_time || ""),
    location: initialData?.location || "",
    is_recurring: initialData?.is_recurring || false,
    recurrence_pattern: initialData?.recurrence_pattern || "",
  });

  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [selectedParticipants, setSelectedParticipants] = useState<Participant[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Convert local datetime strings to UTC ISO for API
    const submitData = {
      ...formData,
      start_time: toIsoUtc(formData.start_time),
      end_time: toIsoUtc(formData.end_time),
      participants: selectedParticipants,
    };
    
    onSubmit(submitData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg">
      <div>
        <label className="block text-sm font-medium mb-1">Title *</label>
        <input
          type="text"
          required
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full px-3 py-2 border rounded-md"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full px-3 py-2 border rounded-md"
          rows={3}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Activity Type *</label>
        <select
          required
          value={formData.activity_type}
          onChange={(e) => handleActivityTypeChange(e.target.value)}
          className="w-full px-3 py-2 border rounded-md"
        >
          {isCoachFallback && (
            <>
              <option value="practice">Practice</option>
              <option value="gym">Gym</option>
              <option value="match">Match</option>
            </>
          )}
          {isParentFallback && (
            <>
              <option value="tournament">Tournament</option>
              <option value="education">Education</option>
            </>
          )}
          {isPlayerFallback && !isCoachFallback && !isParentFallback && (
            <option value="sparring_request">Sparring Request</option>
          )}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Start Time *</label>
          <input
            type="datetime-local"
            required
            value={formData.start_time}
            onChange={(e) => {
              const newStartStr = e.target.value;
              
              // Smart end time calculation based on activity type
              const newEndStr = newStartStr ? calculateEndTime(newStartStr, formData.activity_type) : '';
              
              setFormData({ 
                ...formData, 
                start_time: newStartStr,
                end_time: newEndStr
              });
            }}
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">End Time *</label>
          <input
            type="datetime-local"
            required
            value={formData.end_time}
            onChange={(e) => {
              const newEndStr = e.target.value;
              
              if (!newEndStr || !formData.start_time) {
                setFormData({ ...formData, end_time: newEndStr });
                return;
              }
              
              // END change handler - validate end >= start
              const startMS = parseLocal(formData.start_time).getTime();
              let endMS = parseLocal(newEndStr).getTime();
              if (endMS <= startMS) endMS = startMS + DEFAULT_DURATION;
              
              setFormData(f => ({ 
                ...f, 
                end_time: formatLocal(new Date(endMS)) 
              }));
            }}
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Location</label>
        <input
          type="text"
          value={formData.location}
          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          className="w-full px-3 py-2 border rounded-md"
        />
      </div>

      {/* Participants Section */}
      <div>
        <label className="block text-sm font-medium mb-2">Participants</label>
        {loadingMembers ? (
          <div className="text-sm text-gray-500">Loading team members...</div>
        ) : (
          <div className="space-y-2">
            {getFilteredMembers().map((member) => {
              const isSelected = selectedParticipants.some(p => p.user_id === member.user_id);
              const derivedRole = member.role; // Use actual team role
              
              return (
                <div key={member.user_id} className="flex items-center gap-3 p-2 border rounded">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedParticipants(prev => [...prev, {
                          user_id: member.user_id,
                          role: derivedRole as 'player' | 'coach' | 'parent',
                          email: member.user.email
                        }]);
                      } else {
                        setSelectedParticipants(prev => prev.filter(p => p.user_id !== member.user_id));
                      }
                    }}
                    className="rounded"
                  />
                  <span className="flex-1 text-sm">{member.user.email}</span>
                  {isSelected && (
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded capitalize">
                      {derivedRole}
                    </span>
                  )}
                </div>
              );
            })}
            {getFilteredMembers().length === 0 && (
              <div className="text-sm text-gray-500">
                No team members with suitable roles for {formData.activity_type} events
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.is_recurring}
            onChange={(e) => setFormData({ 
              ...formData, 
              is_recurring: e.target.checked,
              recurrence_pattern: e.target.checked ? "weekly" : ""
            })}
            className="rounded"
          />
          <span className="text-sm font-medium">Repeat weekly</span>
        </label>
      </div>

      <div className="flex gap-2 justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border rounded-md hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          {initialData ? "Update" : "Create"} Event
        </button>
      </div>
    </form>
  );
}