import ReactMarkdown from 'react-markdown';
import { BookOpen } from 'lucide-react';
import type { Problem } from '../../types';

interface ProblemPaneProps {
  problem: Problem;
}

export function ProblemPane({ problem }: ProblemPaneProps) {
  return (
    <div className="flex flex-col h-full bg-surface border-r border-white/5 shadow-xl select-text">
      <div className="h-14 border-b border-border flex items-center px-6 bg-elevated/50 shrink-0">
        <div className="flex items-center gap-2 text-primary-hover font-semibold text-sm">
          <BookOpen className="w-4 h-4" /> Description
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-6 scrollbar-custom">
        <div className="prose prose-sm prose-invert max-w-none 
          prose-headings:text-white prose-headings:font-bold
          prose-p:text-text-secondary prose-p:leading-relaxed
          prose-li:text-text-secondary
          prose-a:text-accent prose-a:underline
          prose-pre:bg-elevated prose-pre:border prose-pre:border-border prose-pre:rounded-xl
          prose-code:text-accent prose-code:bg-accent/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md
          prose-strong:text-white
          text-text-secondary text-base">
          <ReactMarkdown>{problem.description}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
