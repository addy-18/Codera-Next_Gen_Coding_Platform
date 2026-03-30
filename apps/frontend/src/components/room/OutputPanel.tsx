import { Terminal, CheckCircle2, AlertTriangle, Loader2, Sparkles } from 'lucide-react';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

interface OutputPanelProps {
  output: string[];
  verdict: string | null;
  isRunning: boolean;
  scrollRef: React.RefObject<HTMLDivElement | null>;
  onAskAI?: () => void;
}

export function OutputPanel({ output, verdict, isRunning, scrollRef, onAskAI }: OutputPanelProps) {
  return (
    <div className="flex flex-col h-full bg-base border-l border-white/5">
      <div className="h-10 border-b border-border flex items-center px-4 bg-elevated/30 shrink-0 justify-between">
        <h3 className="text-xs font-semibold text-muted uppercase tracking-wider flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5" /> Output Panel
        </h3>
        {isRunning && <Loader2 className="w-3.5 h-3.5 text-accent animate-spin" />}
      </div>
      
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-3 font-mono text-sm scrollbar-custom"
      >
        {output.length === 0 && !isRunning && (
          <div className="flex flex-col items-center justify-center h-full text-muted/50 gap-2">
            <Terminal className="w-8 h-8 opacity-20" />
            <span className="text-xs">Run or Submit to see output</span>
          </div>
        )}

        <AnimatePresence initial={false}>
          {output.map((line, i) => {
            const isError = line.toLowerCase().includes('error');
            const isSuccess = line.toLowerCase().includes('ac') || line.toLowerCase().includes('success');
            
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                layout
                className={clsx(
                  "px-3 py-2 rounded-lg border text-[13px] break-words whitespace-pre-wrap",
                  isError ? "bg-danger/5 border-danger/20 text-danger" :
                  isSuccess ? "bg-success/5 border-success/20 text-success" :
                  line.startsWith('>') ? "bg-elevated/50 border-border text-text-main/90" :
                  "bg-transparent border-transparent text-text-main/70"
                )}
              >
                {line}
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Final Verdict Banner */}
        {verdict && !isRunning && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-4 flex flex-col gap-3"
          >
            <div className={clsx(
                "p-4 rounded-xl border flex items-center justify-between shadow-soft",
                verdict === 'AC' ? "bg-success/10 border-success/30 text-success" : "bg-danger/10 border-danger/30 text-danger"
              )}
            >
              <div className="flex items-center gap-3">
                {verdict === 'AC' ? <CheckCircle2 className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
                <p className="font-bold tracking-wide">Final Verdict: {verdict}</p>
              </div>

              {onAskAI && (
                <button
                  onClick={onAskAI}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-sans font-semibold transition-all hover:scale-105 active:scale-95"
                >
                  <Sparkles className="w-3.5 h-3.5 text-accent" />
                  Ask AI
                </button>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
