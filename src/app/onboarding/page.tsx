'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function OnboardingPage() {
  const [step, setStep] = useState<'choice' | 'create' | 'join'>('choice');
  const [teamName, setTeamName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const createTeam = async () => {
    if (!teamName.trim()) {
      setError('Team name is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const userData = localStorage.getItem('user');
      const user = JSON.parse(userData!);

      const response = await fetch('/api/teams/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamName: teamName.trim(), userId: user.id }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log('Team created! Invite code:', data.inviteCode);
        router.push('/');
      } else {
        setError(data.error || 'Failed to create team');
      }
    } catch (err) {
      setError('Something went wrong');
    }

    setLoading(false);
  };

  const joinTeam = async () => {
    if (!inviteCode.trim()) {
      setError('Invite code is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const userData = localStorage.getItem('user');
      const user = JSON.parse(userData!);

      const response = await fetch('/api/teams/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inviteCode: inviteCode.trim(), userId: user.id }),
      });

      const data = await response.json();

      if (response.ok) {
        router.push('/');
      } else {
        setError(data.error || 'Invalid invite code');
      }
    } catch (err) {
      setError('Something went wrong');
    }

    setLoading(false);
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-center mb-6">Team Setup</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {step === 'choice' && (
          <div className="space-y-4">
            <p className="text-center text-gray-600 mb-6">
              You need to join a team to access the platform
            </p>
            
            <button
              onClick={() => setStep('create')}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
            >
              Create New Team
            </button>
            
            <button
              onClick={() => setStep('join')}
              className="w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700"
            >
              Join Existing Team
            </button>
          </div>
        )}

        {step === 'create' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Team Name
              </label>
              <input
                type="text"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter team name"
                disabled={loading}
              />
            </div>

            <button
              onClick={createTeam}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Team'}
            </button>

            <button
              onClick={() => setStep('choice')}
              className="w-full text-gray-600 hover:underline"
            >
              Back
            </button>
          </div>
        )}

        {step === 'join' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Invite Code
              </label>
              <input
                type="text"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter invite code"
                disabled={loading}
              />
            </div>

            <button
              onClick={joinTeam}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Joining...' : 'Join Team'}
            </button>

            <button
              onClick={() => setStep('choice')}
              className="w-full text-gray-600 hover:underline"
            >
              Back
            </button>
          </div>
        )}
      </div>
    </main>
  );
}