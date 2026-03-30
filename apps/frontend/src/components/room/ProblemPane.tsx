import ReactMarkdown from 'react-markdown';
import { FileText, BookOpen, Lightbulb, FlaskConical, Hash } from 'lucide-react';
import type { Problem } from '../../types';

interface ProblemPaneProps {
  problem: Problem;
}

export function ProblemPane({ problem }: ProblemPaneProps) {
  const numberId = problem.id.replace('problem_', '');

  const difficultyColor =
    problem.difficulty === 'Easy' ? 'text-[#00b8a3] bg-[#00b8a3]/10' :
      problem.difficulty === 'Medium' ? 'text-[#ffc01e] bg-[#ffc01e]/10' :
        'text-[#ff375f] bg-[#ff375f]/10';

  return (
    <div className="flex flex-col h-full bg-[#282828] border-r border-white/5 shadow-xl select-text text-[15px]">

      {/* Top Navigation Tabs */}
      <div className="h-10 border-b border-border flex items-center px-2 bg-[#282828] shrink-0 gap-1 overflow-x-auto no-scrollbar">
        <button className="flex items-center gap-2 px-3 h-full border-b-[2px] border-primary text-primary font-medium text-xs whitespace-nowrap bg-white/5 hover:bg-white/10 transition-colors rounded-t-lg mt-[2px]">
          <FileText className="w-3.5 h-3.5" /> Description
        </button>
        <button className="flex items-center gap-2 px-3 h-full border-b-[2px] border-transparent text-muted hover:text-text-main hover:bg-white/5 font-medium text-xs whitespace-nowrap transition-colors rounded-t-lg mt-[2px]">
          <BookOpen className="w-3.5 h-3.5" /> Editorial
        </button>
        <button className="flex items-center gap-2 px-3 h-full border-b-[2px] border-transparent text-muted hover:text-text-main hover:bg-white/5 font-medium text-xs whitespace-nowrap transition-colors rounded-t-lg mt-[2px]">
          <FlaskConical className="w-3.5 h-3.5" /> Solutions
        </button>
        <button className="flex items-center gap-2 px-3 h-full border-b-[2px] border-transparent text-muted hover:text-text-main hover:bg-white/5 font-medium text-xs whitespace-nowrap transition-colors rounded-t-lg mt-[2px]">
          <Hash className="w-3.5 h-3.5" /> Submissions
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 scrollbar-custom bg-[#282828]">

        {/* Title */}
        <h1 className="text-2xl font-bold text-white mb-4">
          {numberId}. {problem.name}
        </h1>

        {/* Badges Row */}
        <div className="flex flex-wrap items-center gap-3 mb-8">
          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${difficultyColor}`}>
            {problem.difficulty}
          </span>
          <button className="px-2.5 py-1 rounded-full text-xs font-medium text-muted bg-white/5 hover:bg-white/10 transition-colors flex items-center gap-1.5">
            <Lightbulb className="w-3 h-3" /> Hint
          </button>
        </div>

        {/* Markdown Description */}
        <div className="prose prose-sm prose-invert max-w-none 
          prose-headings:text-white prose-headings:font-bold prose-headings:mt-8 prose-headings:mb-4
          prose-p:text-[#c4c4c4] prose-p:leading-[1.6] prose-p:mb-5
          prose-li:text-[#c4c4c4] prose-li:my-1
          prose-ul:list-disc prose-ul:ml-4
          
          prose-pre:bg-white/5 prose-pre:border-l-[3px] prose-pre:border-white/10 prose-pre:rounded-r-lg prose-pre:rounded-bl-lg prose-pre:p-4 prose-pre:my-4
          prose-pre:text-[#c4c4c4] prose-pre:font-mono prose-pre:text-[13px] prose-pre:leading-relaxed
          
          prose-code:text-[#eff2f6] prose-code:bg-white/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:font-mono prose-code:text-[13px] prose-code:font-medium
          prose-a:text-blue-400 prose-a:underline hover:prose-a:text-blue-300
          prose-strong:text-white prose-strong:font-semibold">
          <ReactMarkdown>{problem.description}</ReactMarkdown>
        </div>

      </div>
    </div>
  );
}
