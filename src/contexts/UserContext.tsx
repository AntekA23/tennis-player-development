"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

export type UserRole = 'coach' | 'parent' | 'player';
export type ActivityType = 'practice' | 'gym' | 'match' | 'tournament' | 'education' | 'sparring_request';

interface UserPermissions {
  role: UserRole;
  canCreateEvents: boolean;
  canModifyEvents: boolean;
  canViewAllEvents: boolean;
  allowedEventTypes: ActivityType[];
}

interface UserContextType {
  permissions: UserPermissions | null;
  loading: boolean;
  error: string | null;
  refreshPermissions: () => Promise<void>;
  isCoach: boolean;
  isParent: boolean;
  isPlayer: boolean;
  canCreateEvent: (activityType?: ActivityType) => boolean;
  canModifyEvent: () => boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [permissions, setPermissions] = useState<UserPermissions | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPermissions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/auth/permissions');
      
      if (!response.ok) {
        if (response.status === 401) {
          // Not authenticated, this is expected on login page
          setPermissions(null);
          return;
        }
        throw new Error('Failed to fetch permissions');
      }
      
      const data = await response.json();
      setPermissions(data.permissions);
    } catch (err) {
      console.error('Error fetching permissions:', err);
      setError(err instanceof Error ? err.message : 'Failed to load permissions');
      setPermissions(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPermissions();
  }, []);

  const refreshPermissions = async () => {
    await fetchPermissions();
  };

  // Helper functions for easy permission checking
  const isCoach = permissions?.role === 'coach';
  const isParent = permissions?.role === 'parent';
  const isPlayer = permissions?.role === 'player';

  const canCreateEvent = (activityType?: ActivityType): boolean => {
    if (!permissions?.canCreateEvents) return false;
    if (!activityType) return true;
    return permissions.allowedEventTypes.includes(activityType);
  };

  const canModifyEvent = (): boolean => {
    return permissions?.canModifyEvents || false;
  };

  const value: UserContextType = {
    permissions,
    loading,
    error,
    refreshPermissions,
    isCoach,
    isParent,
    isPlayer,
    canCreateEvent,
    canModifyEvent,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}

// Hook for conditional rendering based on role
export function useRoleAccess() {
  const { permissions, isCoach, isParent, isPlayer, canCreateEvent, canModifyEvent } = useUser();
  
  return {
    permissions,
    isCoach,
    isParent,
    isPlayer,
    canCreateEvent,
    canModifyEvent,
    // UI helpers
    showCreateButton: canCreateEvent(),
    showEditControls: canModifyEvent(),
    showCoachFeatures: isCoach,
    showParentFeatures: isParent,
    showPlayerFeatures: isPlayer,
  };
}