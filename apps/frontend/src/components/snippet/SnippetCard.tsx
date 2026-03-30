import { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import type { Snippet } from '../../types';

interface SnippetCardProps {
  snippet: Snippet;
  onEdit: (snippet: Snippet) => void;
  onDelete: (id: string) => void;
}

export function SnippetCard({ snippet, onEdit, onDelete }: SnippetCardProps) {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(snippet.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const langColor = (l: string) => {
    const map: Record<string, string> = {
      cpp: 'text-[#00b8d9] bg-[#00b8d9]/10',
      python: 'text-[#3bb77e] bg-[#3bb77e]/10',
      java: 'text-error bg-error/10',
      javascript: 'text-tertiary bg-tertiary/10',
      typescript: 'text-blue-400 bg-blue-400/10',
      go: 'text-[#00ADD8] bg-[#00ADD8]/10',
      rust: 'text-[#f75208] bg-[#f75208]/10',
    };
    return map[l] ?? 'text-on-surface-variant bg-surface-container-highest';
  };

  return (
    <div className="bg-surface-container-low border border-[rgba(183,159,255,0.18)] rounded-xl overflow-hidden group hover:border-[rgba(183,159,255,0.45)] hover:shadow-[0_0_24px_rgba(183,159,255,0.12)] hover:-translate-y-0.5 transition-all duration-200 cursor-default">
      {/* Card Header */}
      <div className="flex items-start justify-between px-5 py-4 border-b border-[rgba(183,159,255,0.12)]">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-headline font-bold text-on-surface truncate group-hover:text-primary transition-colors">{snippet.title}</h3>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <span className={`px-2 py-0.5 rounded text-[10px] font-label font-bold uppercase ${langColor(snippet.language)}`}>
              {snippet.language}
            </span>
            {snippet.tags.slice(0, 3).map(t => (
              <span key={t} className="px-2 py-0.5 rounded text-[10px] font-label bg-surface-container-highest text-on-surface-variant">
                #{t}
              </span>
            ))}
          </div>
        </div>
        {/* Actions — always visible, glow on hover */}
        <div className="flex items-center gap-1 ml-3 shrink-0">
          <button
            onClick={handleCopy}
            title="Copy code"
            className="p-1.5 rounded-lg transition-all duration-150 text-on-surface-variant/50 hover:text-primary hover:bg-primary/10 hover:scale-110 active:scale-95"
          >
            <span className="material-symbols-outlined text-[18px]">{copied ? 'check_circle' : 'content_copy'}</span>
          </button>
          <button
            onClick={() => onEdit(snippet)}
            title="Edit"
            className="p-1.5 rounded-lg transition-all duration-150 text-on-surface-variant/50 hover:text-tertiary hover:bg-tertiary/10 hover:scale-110 active:scale-95"
          >
            <span className="material-symbols-outlined text-[18px]">edit</span>
          </button>
          <button
            onClick={() => onDelete(snippet.id)}
            title="Delete"
            className="p-1.5 rounded-lg transition-all duration-150 text-on-surface-variant/50 hover:text-error hover:bg-error/10 hover:scale-110 active:scale-95"
          >
            <span className="material-symbols-outlined text-[18px]">delete</span>
          </button>
        </div>
      </div>

      {/* Code Preview */}
      <div className="relative">
        <div className={`overflow-hidden transition-all duration-300 ${expanded ? 'max-h-[600px]' : 'max-h-40'}`}>
          <SyntaxHighlighter
            language={snippet.language}
            style={oneDark}
            customStyle={{ margin: 0, borderRadius: 0, fontSize: '12px', background: 'rgba(14,13,22,0.7)' }}
            showLineNumbers
          >
            {snippet.code}
          </SyntaxHighlighter>
        </div>
        {/* Expand / Collapse button */}
        {snippet.code.split('\n').length > 8 && (
          <button
            onClick={() => setExpanded(e => !e)}
            className="absolute bottom-0 inset-x-0 flex items-center justify-center py-2 bg-gradient-to-t from-[#0e0d16] via-[#0e0d16]/80 to-transparent text-xs font-label text-on-surface-variant hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined text-sm mr-1">{expanded ? 'expand_less' : 'expand_more'}</span>
            {expanded ? 'Show less' : 'Show more'}
          </button>
        )}
      </div>
    </div>
  );
}
