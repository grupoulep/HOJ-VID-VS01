import React, { useState, useEffect } from 'react';
import { AuthUser, Volunteer } from './types';
import { getStoredVolunteers, saveStoredVolunteers, INITIAL_VOLUNTEERS } from './data/mockData';
import {
  testFirebaseConnection,
  subscribeToVolunteers,
  seedInitialVolunteersIfEmpty,
} from './lib/firebase';
import { LoginForm } from './components/LoginForm';
import { AdminDashboard } from './components/AdminDashboard';
import { WorkerDashboard } from './components/WorkerDashboard';

export default function App() {
  const [volunteers, setVolunteers] = useState<Volunteer[]>(() => getStoredVolunteers());
  const [isFirebaseConnected, setIsFirebaseConnected] = useState(false);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    try {
      const savedUser = localStorage.getItem('portal_voluntarios_session');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  // Connect and sync with Google Firebase Firestore in real time
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    async function initFirebase() {
      try {
        await testFirebaseConnection();
        setIsFirebaseConnected(true);

        // Seed initial data to cloud if collection is new/empty
        await seedInitialVolunteersIfEmpty(INITIAL_VOLUNTEERS);

        // Real-time synchronization with Firestore
        unsubscribe = subscribeToVolunteers(
          (cloudVolunteers) => {
            if (cloudVolunteers && cloudVolunteers.length > 0) {
              setVolunteers(cloudVolunteers);
              saveStoredVolunteers(cloudVolunteers);
            }
            setIsFirebaseConnected(true);
          },
          (err) => {
            console.warn('Error en conexión con Firestore:', err);
          }
        );
      } catch (err) {
        console.error('Error inicializando Firebase:', err);
      }
    }

    initFirebase();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const handleUpdateVolunteers = (updated: Volunteer[]) => {
    setVolunteers(updated);
    saveStoredVolunteers(updated);
  };

  const handleLogin = (user: AuthUser) => {
    setCurrentUser(user);
    try {
      localStorage.setItem('portal_voluntarios_session', JSON.stringify(user));
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('portal_voluntarios_session');
    } catch (e) {
      console.error(e);
    }
  };

  // If logged in as worker, get latest volunteer data from volunteers list
  const currentVolunteerData =
    currentUser?.role === 'worker'
      ? volunteers.find((v) => v.id === currentUser.id || v.username.toLowerCase() === currentUser.username.toLowerCase()) ||
        currentUser.volunteerData ||
        volunteers[0]
      : undefined;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50/50 to-blue-100/60 text-slate-800 relative overflow-x-hidden selection:bg-blue-600 selection:text-white font-sans antialiased">
      {/* Decorative ambient crystalline glow effects in background */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-sky-300/20 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="fixed bottom-10 right-10 w-[30rem] h-[30rem] bg-blue-400/15 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="fixed top-1/3 right-1/4 w-80 h-80 bg-indigo-300/15 rounded-full blur-3xl pointer-events-none -z-10" />

      {!currentUser && (
        <LoginForm
          volunteers={volunteers}
          onLoginSuccess={handleLogin}
        />
      )}

      {currentUser && currentUser.role === 'admin' && (
        <AdminDashboard
          volunteers={volunteers}
          onUpdateVolunteers={handleUpdateVolunteers}
          onLogout={handleLogout}
          isFirebaseConnected={isFirebaseConnected}
        />
      )}

      {currentUser && currentUser.role === 'worker' && currentVolunteerData && (
        <WorkerDashboard
          volunteer={currentVolunteerData}
          onLogout={handleLogout}
        />
      )}
    </div>
  );
}


