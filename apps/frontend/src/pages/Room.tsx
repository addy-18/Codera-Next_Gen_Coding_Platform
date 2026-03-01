import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../hooks/useAuth';
import { useCollaboration } from '../hooks/useCollaboration';
import { useRoomSocket } from '../hooks/useRoomSocket';
import { ToastContainer, useToasts } from '../components/Toast';
import { Loader2, Menu, X } from 'lucide-react';
import type { Problem as ProblemType, TestResultEvent, FinalVerdictEvent } from '../types';

import { TopBar } from '../components/room/TopBar';
import { BottomStatusBar } from '../components/room/BottomStatusBar';
import { ProblemPane } from '../components/room/ProblemPane';
import { EditorWrapper, LANGUAGES } from '../components/room/EditorWrapper';
import { ParticipantsList } from '../components/room/ParticipantsList';
import { OutputPanel } from '../components/room/OutputPanel';
import { motion, AnimatePresence } from 'framer-motion';

export function Room() {
  const { roomId } = useParams<{ roomId: string }>();
  const { user, token } = useAuth();

  const [problem, setProblem] = useState<ProblemType | null>(null);
  const [languageId, setLanguageId] = useState(71);
  const [output, setOutput] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [verdict, setVerdict] = useState<string | null>(null);
  const [roomData, setRoomData] = useState<any>(null);
  const [remoteCursors, setRemoteCursors] = useState<Record<string, { position: any, color: string, username: string }>>({});

  // Mobile responsive layout states
  const [showMobileLeft, setShowMobileLeft] = useState(false);
  const [showMobileRight, setShowMobileRight] = useState(false);

  const { toasts, addToast, removeToast } = useToasts();
  const outputScrollRef = useRef<HTMLDivElement>(null);

  const { content, isConnected: sharedbConnected, updateContent } = useCollaboration({
    roomId: roomId || '',
    token,
  });

  const { isConnected: wsConnected, participants, canEdit, lastEvent, sendMessage, setInitialParticipants } = useRoomSocket({
    roomId: roomId || '',
    userId: user?.id || '',
  });

  const isHost = roomData?.hostId === user?.id;

  useEffect(() => {
    if (outputScrollRef.current) {
      outputScrollRef.current.scrollTop = outputScrollRef.current.scrollHeight;
    }
  }, [output]);

  useEffect(() => {
    if (!roomId || !token) return;
    
    // Ensure user is added to the room so host sees them and WS broadcasts work
    api.post(`/api/rooms/${roomId}/join`)
      .catch(err => console.log('Join room note:', err?.response?.data || err.message))
      .finally(() => {
        api.get(`/api/rooms/${roomId}`).then(res => {
          setRoomData(res.data);
          // Seed participants + canEdit from REST so user can type immediately
          if (res.data.participants) {
            setInitialParticipants(res.data.participants);
          }
          api.get(`/problems/${res.data.problemId}`).then(pRes => {
            setProblem(pRes.data);
            if (!content) {
              const boilerplate = pRes.data.halfBoilerplate?.python || '';
              updateContent(boilerplate);
            }
          });
        }).catch(err => {
          console.error('Failed to load room:', err);
        });
      });
  }, [roomId, token]);

  useEffect(() => {
    if (!problem) return;
    const langName = LANGUAGES.find(l => l.id === languageId)?.name.toLowerCase();
    const key = langName === 'c++' ? 'cpp' : langName;
    if (key && problem.halfBoilerplate?.[key] && isHost) {
      updateContent(problem.halfBoilerplate[key]);
    }
  }, [languageId]);

  useEffect(() => {
    if (!lastEvent) return;
    switch (lastEvent.type) {
      case 'user_joined':
        addToast({ type: 'info', title: 'User Joined', message: `${lastEvent.username} joined` });
        break;
      case 'user_left':
        addToast({ type: 'info', title: 'User Left', message: `${lastEvent.username} left` });
        setRemoteCursors(prev => {
          const next = { ...prev };
          delete next[lastEvent.userId];
          return next;
        });
        break;
      case 'permission_update':
        addToast({
          type: 'info',
          title: 'Permission Updated',
          message: `Edit ${lastEvent.canEdit ? 'enabled' : 'disabled'} for ${lastEvent.targetUserId === user?.id ? 'you' : 'a user'}`,
        });
        break;
      case 'run_result':
        if (lastEvent.status === 'queued') {
          addToast({ type: 'run', title: 'Running', message: `Execution started by ${lastEvent.executedBy === user?.id ? 'you' : 'a participant'}` });
          if (lastEvent.submissionId) sendMessage({ type: 'subscribe_submission', submissionId: lastEvent.submissionId });
          setShowMobileRight(true); // Auto-open panel on mobile
        }
        break;
      case 'submit_result':
        if (lastEvent.verdict === 'judging') {
          addToast({ type: 'info', title: 'Submitted', message: 'Judging code...' });
          if (lastEvent.submissionId) sendMessage({ type: 'subscribe_submission', submissionId: lastEvent.submissionId });
          setShowMobileRight(true);
        } else {
          addToast({
            type: lastEvent.verdict === 'AC' ? 'success' : 'error',
            title: 'Result',
            message: `Verdict: ${lastEvent.verdict} | Time: ${lastEvent.runtime} | Mem: ${lastEvent.memory}`,
          });
        }
        break;
      case 'test_result': {
        const msg = lastEvent as unknown as TestResultEvent;
        setOutput(prev => [...prev, `> Test Case ${msg.testcaseIndex}: ${msg.verdict} ${msg.time ? `(${msg.time}s)` : ''}`]);
        break;
      }
      case 'final_verdict': {
        const msg = lastEvent as unknown as FinalVerdictEvent;
        setVerdict(msg.verdict);
        setIsRunning(false);
        setOutput(prev => [...prev, `\nSystem: ${msg.verdict} (${msg.passedTests}/${msg.totalTests} passes)`]);
        break;
      }
      case 'cursor_update': {
        const msg = lastEvent as any;
        setRemoteCursors(prev => ({
          ...prev,
          [msg.userId]: { position: msg.position, color: msg.color, username: msg.username }
        }));
        break;
      }
      case 'language_change': {
        const msg = lastEvent as any;
        setLanguageId(msg.languageId);
        break;
      }
    }
  }, [lastEvent]);

  const getUserColor = (id: string) => {
    const colors = ['#e24a6a', '#3bb77e', '#ffd166', '#5b3e7a', '#007acc', '#d2527f'];
    const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  const handleCursorChange = (position: any) => {
    if (!user) return;
    sendMessage({
      type: 'cursor_update',
      position,
      color: getUserColor(user.id),
      username: user.username
    });
  };

  const handleLanguageChange = (id: number) => {
    setLanguageId(id);
    if (canEdit && user) {
      sendMessage({
        type: 'language_change',
        languageId: id
      });
    }
  };

  const handleRun = async () => {
    if (!roomId || isRunning) return;
    setIsRunning(true);
    setVerdict(null);
    setOutput(['Running sample tests...']);
    setShowMobileRight(true);
    try {
      await api.post(`/api/rooms/${roomId}/run`, { languageId });
    } catch (e: any) {
      setIsRunning(false);
      setOutput(prev => [...prev, `Error: ${e.response?.data?.error || e.message}`]);
    }
  };

  const handleSubmit = async () => {
    if (!roomId || isRunning) return;
    setIsRunning(true);
    setVerdict(null);
    setOutput(['Submitting full solution...']);
    setShowMobileRight(true);
    try {
      await api.post(`/api/rooms/${roomId}/submit`, { languageId });
    } catch (e: any) {
      setIsRunning(false);
      setOutput(prev => [...prev, `Error: ${e.response?.data?.error || e.message}`]);
    }
  };

  const handleTogglePermission = async (targetUserId: string, currentCanEdit: boolean) => {
    if (!roomId) return;
    try {
      await api.patch(`/api/rooms/${roomId}/permissions`, { targetUserId, canEdit: !currentCanEdit });
      // Refetch room data so local participants state is always fresh
      const res = await api.get(`/api/rooms/${roomId}`);
      if (res.data.participants) {
        setInitialParticipants(res.data.participants);
      }
    } catch (e: any) {
      addToast({ type: 'error', title: 'Error', message: e.response?.data?.error || 'Failed' });
    }
  };

  if (!roomData || !problem || !user) {
    return (
      <div className="min-h-screen bg-base flex flex-col items-center justify-center text-text-main gap-4">
        <Loader2 className="animate-spin w-8 h-8 text-primary" />
        <p className="text-sm text-muted animate-pulse">Entering workspace...</p>
      </div>
    );
  }

  // Determine current language name for status bar
  const currentLangName = LANGUAGES.find(l => l.id === languageId)?.name || 'Python';

  return (
    <div className="h-screen w-full bg-base text-text-main flex flex-col overflow-hidden font-sans">
      
      {/* 1. Top Navigation Bar */}
      <TopBar 
        problemName={problem.name}
        difficulty={problem.difficulty}
        isHost={isHost}
        roomId={roomId || ''}
        isRunning={isRunning}
        canEdit={canEdit}
        onRun={handleRun}
        onSubmit={handleSubmit}
      />

      {/* Mobile Overlay triggers */}
      <div className="xl:hidden h-10 bg-surface border-b border-border flex items-center justify-between px-4 shrink-0 shadow-sm z-10">
        <button onClick={() => setShowMobileLeft(true)} className="flex items-center gap-2 text-primary-hover text-sm font-medium">
          <Menu className="w-4 h-4" /> Problem Details
        </button>
        <button onClick={() => setShowMobileRight(true)} className="flex items-center gap-2 text-accent text-sm font-medium">
          Output / Users <Menu className="w-4 h-4" />
        </button>
      </div>

      {/* 2. Main Workspace Area */}
      {/* 12-column grid on desktop ( >=1280px ) */}
      <div className="flex-1 overflow-hidden relative xl:grid xl:grid-cols-12 flex flex-col">
        
        {/* Left Pane: Problem Description (3 cols) */}
        <div className="hidden xl:block xl:col-span-3 h-full">
          <ProblemPane problem={problem} />
        </div>

        {/* Center Pane: Editor (6 cols) */}
        <div className="flex-1 xl:col-span-6 h-full min-w-0 z-0 border-r border-border shadow-[0_0_40px_rgba(0,0,0,0.5)]">
          <EditorWrapper 
            content={content}
            languageId={languageId}
            canEdit={canEdit}
            onChange={updateContent}
            onLanguageChange={handleLanguageChange}
            onCursorChange={handleCursorChange}
            remoteCursors={remoteCursors}
          />
        </div>

        {/* Right Pane: Participants + Output (3 cols) */}
        <div className="hidden xl:flex xl:flex-col xl:col-span-3 h-full">
          <div className="h-1/2 min-h-[250px] border-b border-border">
            <ParticipantsList 
              participants={participants}
              currentUserId={user.id}
              isHost={isHost}
              onTogglePermission={handleTogglePermission}
            />
          </div>
          <div className="flex-1 min-h-[250px]">
            <OutputPanel 
              output={output}
              verdict={verdict}
              isRunning={isRunning}
              scrollRef={outputScrollRef}
            />
          </div>
        </div>

        {/* --- Mobile Overlays --- */}
        <AnimatePresence>
          {showMobileLeft && (
             <motion.div 
               initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
               transition={{ type: 'spring', damping: 25, stiffness: 200 }}
               className="absolute inset-y-0 left-0 w-4/5 max-w-sm bg-base z-30 shadow-2xl xl:hidden border-r border-border flex flex-col"
             >
               <button onClick={() => setShowMobileLeft(false)} className="absolute top-3 right-3 p-1.5 rounded-lg bg-white/5 hover:bg-white/10 active:scale-95 transition-all">
                 <X className="w-5 h-5 text-muted" />
               </button>
               <ProblemPane problem={problem} />
             </motion.div>
          )}

          {showMobileRight && (
             <motion.div 
               initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
               transition={{ type: 'spring', damping: 25, stiffness: 200 }}
               className="absolute inset-x-0 bottom-0 h-4/5 bg-base z-30 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] xl:hidden border-t border-border flex flex-col rounded-t-2xl overflow-hidden"
             >
               <div className="flex justify-center p-2 cursor-grab active:cursor-grabbing bg-surface border-b border-border shrink-0" onClick={() => setShowMobileRight(false)}>
                 <div className="w-12 h-1.5 bg-border rounded-full" />
               </div>
               <div className="flex-1 overflow-y-auto">
                 <div className="h-[40vh] border-b border-border">
                   <OutputPanel output={output} verdict={verdict} isRunning={isRunning} scrollRef={outputScrollRef} />
                 </div>
                 <div className="h-[40vh]">
                   <ParticipantsList participants={participants} currentUserId={user.id} isHost={isHost} onTogglePermission={handleTogglePermission} />
                 </div>
               </div>
             </motion.div>
          )}

          {(showMobileLeft || showMobileRight) && (
             <motion.div 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               onClick={() => { setShowMobileLeft(false); setShowMobileRight(false); }}
               className="absolute inset-0 bg-black/60 backdrop-blur-sm z-20 xl:hidden"
             />
          )}
        </AnimatePresence>

      </div>

      {/* 3. Bottom Status Bar */}
      <BottomStatusBar 
        isConnected={sharedbConnected || wsConnected}
        canEdit={canEdit}
        languageName={currentLangName}
      />

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
