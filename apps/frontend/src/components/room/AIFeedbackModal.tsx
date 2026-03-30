import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Loader2, Bot } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { api } from '../../lib/api';

interface AIFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  problem: { name: string; description: string };
  code: string;
  language: string;
  verdict: string;
}

export function AIFeedbackModal({ isOpen, onClose, problem, code, language, verdict }: AIFeedbackModalProps) {
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && !feedback && !isLoading && !error) {
      fetchFeedback();
    }
    // Reset state if closed
    if (!isOpen) {
      setFeedback(null);
      setError(null);
    }
  }, [isOpen]); // Intentionally not including other deps so we don't refetch on every keystroke unless opened anew

  const fetchFeedback = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.post('/api/ai/analyze', {
        problemName: problem.name,
        problemDescription: problem.description,
        code,
        language,
        verdict
      });
      setFeedback(res.data.feedback);
    } catch (err: any) {
      console.error('Failed to fetch AI feedback', err);
      setError(err.response?.data?.error || 'Failed to analyze code. Make sure your AI configuration is set up.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-3xl max-h-[85vh] bg-[#1a1825] border border-primary/20 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-white/5 bg-gradient-to-r from-primary/10 to-transparent">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/30">
                  <Bot className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    AI Code Analysis <Sparkles className="w-4 h-4 text-accent" />
                  </h2>
                  <p className="text-xs text-muted">Structural feedback and hints for {problem.name}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-white/10 text-muted hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-6 scrollbar-custom bg-[#13121c]">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center h-64 gap-4 text-muted">
                  <div className="relative">
                    <Loader2 className="w-10 h-10 animate-spin text-primary" />
                    <Sparkles className="w-4 h-4 text-accent absolute top-0 right-0 animate-pulse" />
                  </div>
                  <p className="animate-pulse">Analyzing logic and structure...</p>
                </div>
              ) : error ? (
                <div className="bg-danger/10 border border-danger/30 rounded-xl p-6 text-center text-danger">
                  <p className="font-semibold mb-2">Analysis Failed</p>
                  <p className="text-sm opacity-80">{error}</p>
                  <button 
                    onClick={fetchFeedback}
                    className="mt-4 px-4 py-2 bg-danger/20 hover:bg-danger/30 rounded-lg text-sm transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              ) : feedback ? (
                <div className="prose prose-invert prose-p:text-sm prose-li:text-sm max-w-none prose-headings:text-primary prose-a:text-accent">
                  <ReactMarkdown
                    components={{
                      code({ node, inline, className, children, ...props }: any) {
                        const match = /language-(\w+)/.exec(className || '');
                        return !inline && match ? (
                          <SyntaxHighlighter
                            {...props}
                            style={oneDark as any}
                            language={match[1]}
                            PreTag="div"
                            className="rounded-lg !my-4 border border-white/10"
                          >
                            {String(children).replace(/\n$/, '')}
                          </SyntaxHighlighter>
                        ) : (
                          <code {...props} className="bg-white/10 px-1.5 py-0.5 rounded text-primary-hover font-mono text-sm">
                            {children}
                          </code>
                        );
                      }
                    }}
                  >
                    {feedback}
                  </ReactMarkdown>
                </div>
              ) : null}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-white/5 bg-[#1a1825] flex justify-end">
              <button
                onClick={onClose}
                className="px-5 py-2.5 bg-surface-hover hover:bg-border rounded-lg text-sm font-medium transition-colors"
              >
                Close Feedback
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
