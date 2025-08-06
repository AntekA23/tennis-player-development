'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from "next/link";
import CalendarView from '@/components/calendar/CalendarView';
import CalendarEventForm from '@/components/calendar/CalendarEventForm';

interface User {
  id: number;
  email: string;
  role: string;
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

interface Team {
  id: number;
  name: string;
  members: TeamMember[];
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEventForm, setShowEventForm] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/auth');
      return;
    }

    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);

    // Fetch team data
    fetch(`/api/teams/details?userId=${parsedUser.id}`)
      .then(res => res.json())
      .then(data => {
        if (data.team) {
          setTeam(data.team);
        } else {
          router.push('/onboarding');
        }
      })
      .catch(() => {
        router.push('/onboarding');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/auth');
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user || !team) {
    return null;
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <div className="text-left">
            <p className="text-lg font-medium text-gray-800">Welcome {user.email}</p>
            <p className="text-sm text-gray-600">Role: {user.role}</p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
          >
            Logout
          </button>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Team: {team.name}</h1>
          
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Team Members</h2>
            <div className="space-y-2">
              {team.members.map((member) => (
                <div key={member.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="font-medium">{member.user.email}</span>
                  <span className="text-sm text-gray-600 capitalize">
                    {member.role} • {member.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

        <div className="bg-white rounded-lg shadow-lg p-8 mt-8">
          <CalendarView />
        </div>

        <div className="text-center">
          <Link href="/about" className="text-blue-600 hover:underline">
            Learn more about this project
          </Link>
        </div>
      </div>
    </main>
  );
}