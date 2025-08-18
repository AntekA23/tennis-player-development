"use client";

import React from 'react';
import { Activity, Role, PARTICIPANT_RULES, normType } from '@/lib/domain';
import { canParticipateInActivity } from '@/lib/ui/permissions';

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

interface ParticipantSelectorProps {
  activityType: string;
  teamMembers: TeamMember[];
  selectedParticipants: Participant[];
  onParticipantsChange: (participants: Participant[]) => void;
  loading?: boolean;
}

export default function ParticipantSelector({
  activityType,
  teamMembers,
  selectedParticipants,
  onParticipantsChange,
  loading = false
}: ParticipantSelectorProps) {
  const normalizedActivity = normType(activityType) as Activity;
  const eligibleRoles = PARTICIPANT_RULES[normalizedActivity] || [];
  
  // Filter members by eligibility
  const eligibleMembers = teamMembers
    .filter(m => m.status === 'accepted')
    .filter(m => canParticipateInActivity(m.role, normalizedActivity));
    
  const ineligibleMembers = teamMembers
    .filter(m => m.status === 'accepted')
    .filter(m => !canParticipateInActivity(m.role, normalizedActivity));

  const handleMemberToggle = (member: TeamMember, isSelected: boolean) => {
    if (isSelected) {
      const newParticipant: Participant = {
        user_id: member.user_id,
        role: member.role,
        email: member.user.email
      };
      onParticipantsChange([...selectedParticipants, newParticipant]);
    } else {
      onParticipantsChange(
        selectedParticipants.filter(p => p.user_id !== member.user_id)
      );
    }
  };

  if (loading) {
    return (
      <div className="space-y-2">
        <div className="text-sm text-gray-500">Loading team members...</div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Debug counter */}
      <div className="text-xs text-gray-500">
        {teamMembers.filter(m => m.status === 'accepted').length} total · {eligibleMembers.length} eligible
      </div>
      
      {/* Eligible members */}
      {eligibleMembers.length > 0 && (
        <div className="space-y-2">
          {eligibleMembers.map((member) => {
            const isSelected = selectedParticipants.some(p => p.user_id === member.user_id);
            
            return (
              <div key={member.user_id} className="flex items-center gap-3 p-2 border rounded">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={(e) => handleMemberToggle(member, e.target.checked)}
                  className="rounded"
                />
                <span className="flex-1 text-sm">{member.user.email}</span>
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded capitalize">
                  {member.role}
                </span>
              </div>
            );
          })}
        </div>
      )}
      
      {/* Ineligible members (disabled with tooltip) */}
      {ineligibleMembers.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs text-gray-400 border-t pt-2">Ineligible for {normalizedActivity}:</div>
          {ineligibleMembers.map((member) => (
            <div 
              key={member.user_id} 
              className="flex items-center gap-3 p-2 border rounded bg-gray-50 opacity-60"
              title={`Role not allowed for this activity. ${normalizedActivity} allows: ${eligibleRoles.join(', ')}`}
            >
              <input
                type="checkbox"
                disabled
                className="rounded opacity-50"
              />
              <span className="flex-1 text-sm text-gray-500">{member.user.email}</span>
              <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded capitalize">
                {member.role}
              </span>
            </div>
          ))}
        </div>
      )}
      
      {/* No eligible members */}
      {eligibleMembers.length === 0 && ineligibleMembers.length === 0 && (
        <div className="text-sm text-gray-500">
          No team members available for {normalizedActivity} events
        </div>
      )}
      
      {eligibleMembers.length === 0 && ineligibleMembers.length > 0 && (
        <div className="text-sm text-amber-600">
          No team members with suitable roles for {normalizedActivity} events.
          <br />
          <span className="text-xs">Allowed roles: {eligibleRoles.join(', ')}</span>
        </div>
      )}
    </div>
  );
}