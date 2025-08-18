"use client";

import React, { useState } from "react";
import { useRoleAccess } from "@/contexts/UserContext";
import { Activity, Role, normType, CREATOR_RULES } from '@/lib/domain';
import { canCreateActivity, getAllowedActivities } from '@/lib/ui/permissions';
import ParticipantSelector from './ParticipantSelector';

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
  role: Role;
  status: string;
  user: {
    email: string;
  };
}

interface Participant {
  user_id: number;
  role: Role;
  email: string;
}

export default function CalendarEventForm({
  onSubmit,
  onCancel,
  initialData,
}: CalendarEventFormProps) {
  const { isCoach, isParent, isPlayer, permissions } = useRoleAccess();
  const [serverError, setServerError] = useState<string | null>(null);
  
  // Get user role from server permissions (no fallbacks)
  const userRole = permissions?.role;
  
  React.useEffect(() => {
    if (!userRole) return;
    
    // Fetch team members for participant selection
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      fetch(`/api/teams/details?userId=${user.id}`)
        .then(res => res.json())
        .then(data => {
          if (data.team?.members) {
            setTeamMembers(data.team.members);
            
            // Auto-select players for tournaments created by coach/parent
            if (userRole === 'coach' || userRole === 'parent') {
              const players = data.team.members.filter((member: any) => {
                return member.status === 'accepted' && member.role === 'player';
              });
              
              const autoSelectedParticipants = players.map((player: any) => ({
                user_id: player.user_id,
                role: 'player' as const,
                email: player.user.email
              }));
              
              // Only auto-select for tournaments
              // Use first allowed activity for role (inline to avoid dependency)
              const allowedActivities = getAllowedActivities(userRole);
              const defaultType = initialData?.activity_type || allowedActivities[0] || 'practice';
              if (defaultType === 'tournament') {
                setSelectedParticipants(autoSelectedParticipants);
              }
            }
          }
        })
        .catch(console.error)
        .finally(() => setLoadingMembers(false));
    }
  }, [userRole, initialData?.activity_type]);

  // Remove local type definitions - use domain contract only

  // Handle activity type change with participant validation
  const handleActivityTypeChange = (newType: string) => {
    // Clear participants when changing activity type (let user reselect)
    setSelectedParticipants([]);
    
    // Update activity type and recalculate end time if start time is set
    let updatedData = { ...formData, activity_type: newType };
    if (formData.start_time && !endTouched) {
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
      case 'education':
        durationMs = 60 * 60 * 1000; // Education: exactly 60 minutes
        break;
      case 'practice':
      case 'gym':
        durationMs = 60 * 60 * 1000; // 60 minutes
        break;
      case 'match':
      case 'sparring_request':
        durationMs = 90 * 60 * 1000; // 90 minutes
        break;
      case 'tournament':
        // Tournament duration handled by server based on scope
        // Client shows preview only - server computes final duration
        const scopeDays = tournamentScope === 'international_te' ? 3 : 2;
        durationMs = scopeDays * 24 * 60 * 60 * 1000;
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
    if (!userRole) return "practice";
    
    // Use first allowed activity for role
    const allowedActivities = getAllowedActivities(userRole);
    return allowedActivities[0] || "practice";
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
  const [tournamentScope, setTournamentScope] = useState<'national' | 'international_te'>('national');
  const [endTouched, setEndTouched] = useState(false);

  // Activity type validation using domain contract
  const normalizedActivity = normType(formData.activity_type) as Activity;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    
    try {
      // Convert local datetime strings to UTC ISO for API
      const submitData = {
        ...formData,
        start_time: toIsoUtc(formData.start_time),
        end_time: (normalizedActivity === 'education' || normalizedActivity === 'tournament') && !endTouched ? undefined : toIsoUtc(formData.end_time),
        participants: selectedParticipants,
        tournamentScope: normalizedActivity === 'tournament' ? tournamentScope : undefined,
        endTouched: endTouched,
      };
      
      await onSubmit(submitData);
    } catch (error: any) {
      // Surface exact server error
      setServerError(error.message || 'Failed to save event');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg">
      {serverError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
          {serverError}
        </div>
      )}
      
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
          {userRole && getAllowedActivities(userRole).map(activity => (
            <option key={activity} value={activity}>
              {activity === 'sparring' ? 'Sparring' : activity.charAt(0).toUpperCase() + activity.slice(1)}
            </option>
          ))}
        </select>
        {!userRole && (
          <div className="text-sm text-gray-500 mt-1">Loading permissions...</div>
        )}
      </div>

      {/* Tournament Scope - Only show for tournaments */}
      {formData.activity_type === 'tournament' && (
        <div>
          <label className="block text-sm font-medium mb-1">Tournament Scope *</label>
          <select
            required
            value={tournamentScope}
            onChange={(e) => {
              setTournamentScope(e.target.value as 'national' | 'international_te');
              // Auto-update end time if not manually touched
              if (!endTouched && formData.start_time) {
                const days = e.target.value === 'national' ? 2 : 3;
                const start = parseLocal(formData.start_time);
                const end = new Date(start.getTime() + days * 24 * 60 * 60 * 1000);
                setFormData({ ...formData, end_time: formatLocal(end) });
              }
            }}
            className="w-full px-3 py-2 border rounded-md"
          >
            <option value="national">National</option>
            <option value="international_te">International-TE</option>
          </select>
        </div>
      )}

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
          <label className="block text-sm font-medium mb-1">
            End Time *
            {!endTouched && (normalizedActivity === 'education' || normalizedActivity === 'tournament') && (
              <span className="text-xs text-gray-500 ml-2">
                (auto: {normalizedActivity === 'education' ? '+60m' : `+${tournamentScope === 'international_te' ? '3d' : '2d'} by scope`})
              </span>
            )}
          </label>
          <input
            type="datetime-local"
            required
            value={formData.end_time}
            onChange={(e) => {
              const newEndStr = e.target.value;
              setEndTouched(true); // User manually edited end time
              
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
        <ParticipantSelector
          activityType={formData.activity_type}
          teamMembers={teamMembers}
          selectedParticipants={selectedParticipants}
          onParticipantsChange={setSelectedParticipants}
          loading={loadingMembers}
        />
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