import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import type { Problem } from '../types';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Code2, Users, Loader2, LogIn } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { motion } from 'framer-motion';
import clsx from 'clsx';

export function Home() {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [creatingRoomFor, setCreatingRoomFor] = useState<string | null>(null);
  const [joinRoomId, setJoinRoomId] = useState('');
  const [joinError, setJoinError] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  useEffect(() => {
    api.get('/problems')
      .then((res) => setProblems(res.data))
      .catch((err) => console.error(err));
  }, []);

  const handleCreateRoom = async (problemId: string) => {
    if (!user) {
      navigate('/login');
      return;
    }
    setCreatingRoomFor(problemId);
    try {
      const res = await api.post('/api/rooms', { problemId, mode: 'interview' });
      navigate(`/room/${res.data.roomId}`);
    } catch (err) {
      console.error('Failed to create room:', err);
      setCreatingRoomFor(null);
    }
  };

  const handleJoinRoom = async () => {
    const trimmed = joinRoomId.trim();
    if (!trimmed) return;
    if (!user) {
      navigate('/login');
      return;
    }
    setJoinError('');
    setIsJoining(true);
    try {
      await api.post(`/api/rooms/${trimmed}/join`);
      navigate(`/room/${trimmed}`);
    } catch (err: any) {
      setJoinError(err.response?.data?.error || 'Room not found or unable to join');
      setIsJoining(false);
    }
  };

  return (
    <div className="min-h-screen bg-base text-text-main selection:bg-primary/30 font-sans">
      <header className="border-b border-border bg-surface/80 backdrop-blur-xl sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-tr from-primary to-primary-hover p-2 rounded-xl shadow-glow">
              <Code2 className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight text-text-main">Codera</span>
          </div>
          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4 text-sm font-medium">
                <span className="text-muted hidden sm:inline">Welcome, <span className="text-text-main font-semibold">{user.username}</span></span>
                <button 
                  onClick={logout}
                  className="px-4 py-2 hover:bg-elevated rounded-lg transition-colors border border-transparent hover:border-border"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button 
                onClick={() => navigate('/login')}
                className="px-5 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg font-medium transition-colors shadow-soft"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-16 max-w-7xl">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12 max-w-2xl"
        >
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-text-main tracking-tight">
            Collaborative <br className="hidden md:block"/> Problem Solving
          </h1>
          <p className="text-muted text-lg md:text-xl">
            Select a challenge below to instantly launch a real-time multiplayer code editor and invite peers to your session.
          </p>
        </motion.div>

        {/* Join Room Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-12 bg-surface border border-border rounded-2xl p-6 max-w-xl"
        >
          <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
            <LogIn className="w-5 h-5 text-accent" /> Join an Existing Room
          </h2>
          <p className="text-muted text-sm mb-4">
            Have a Room ID? Paste it below to join your teammate's session.
          </p>
          <div className="flex gap-3">
            <input
              type="text"
              value={joinRoomId}
              onChange={(e) => { setJoinRoomId(e.target.value); setJoinError(''); }}
              onKeyDown={(e) => e.key === 'Enter' && handleJoinRoom()}
              placeholder="Paste Room ID here..."
              className="flex-1 px-4 py-2.5 bg-base border border-border rounded-xl text-text-main placeholder:text-muted/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors text-sm"
            />
            <button
              onClick={handleJoinRoom}
              disabled={!joinRoomId.trim() || isJoining}
              className="px-6 py-2.5 bg-accent hover:bg-accent-hover text-base font-semibold rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 text-sm shadow-soft"
            >
              {isJoining ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Joining...</>
              ) : (
                <>Join <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </div>
          {joinError && (
            <p className="mt-3 text-danger text-sm font-medium">{joinError}</p>
          )}
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {problems.map((problem, idx) => (
            <motion.div 
              key={problem.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.05 }}
              onClick={() => handleCreateRoom(problem.id)}
              className="group relative bg-surface border border-border rounded-2xl p-6 hover:bg-elevated cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-soft"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              <div className="relative flex flex-col h-full">
                <div className="flex justify-between items-start mb-4">
                  <span className={clsx(
                    "px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider",
                    problem.difficulty === 'Easy' ? 'bg-success/15 text-success' :
                    problem.difficulty === 'Medium' ? 'bg-accent/15 text-accent' :
                    'bg-danger/15 text-danger'
                  )}>
                    {problem.difficulty}
                  </span>
                  <div className="p-1.5 rounded-lg bg-base border border-border text-muted group-hover:text-primary transition-colors">
                    <Users className="w-4 h-4" />
                  </div>
                </div>
                
                <h2 className="text-xl font-bold mb-3 text-text-main group-hover:text-primary-hover transition-colors">
                  {problem.name}
                </h2>
                
                <p className="text-muted text-sm mb-6 flex-1 line-clamp-3 leading-relaxed">
                  {problem.description.substring(0, 150)}...
                </p>
                
                <div className="flex items-center pt-4 border-t border-border mt-auto">
                  <button className="flex items-center gap-2 text-sm font-semibold text-text-main group-hover:text-primary transition-colors">
                    {creatingRoomFor === problem.id ? (
                      <><Loader2 className="w-4 h-4 animate-spin text-primary" /> Creating Room...</>
                    ) : (
                      <>Start Session <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
}
