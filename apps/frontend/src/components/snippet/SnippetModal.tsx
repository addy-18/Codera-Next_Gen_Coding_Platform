import { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import type { Snippet } from '../../types';

const LANGUAGES = ['cpp', 'python', 'java', 'javascript', 'typescript', 'go', 'rust', 'c', 'csharp'];

interface SnippetModalProps {
  snippet?: Snippet | null;    // null ⟹ create mode
  onClose: () => void;
  onSave: (data: Pick<Snippet, 'title' | 'code' | 'language' | 'tags'>) => Promise<void>;
}

export function SnippetModal({ snippet, onClose, onSave }: SnippetModalProps) {
  const [title, setTitle] = useState(snippet?.title ?? '');
  const [code, setCode] = useState(snippet?.code ?? '');
  const [language, setLanguage] = useState(snippet?.language ?? 'cpp');
  const [tagsRaw, setTagsRaw] = useState(snippet?.tags.join(', ') ?? '');
  const [isSaving, setIsSaving] = useState(false);
  const [preview, setPreview] = useState(false);

  const handleSave = async () => {
    if (!title.trim() || !code.trim()) return;
    setIsSaving(true);
    try {
      await onSave({
        title: title.trim(),
        code,
        language,
        tags: tagsRaw.split(',').map(t => t.trim()).filter(Boolean),
      });
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="w-full max-w-3xl bg-[#13121c] border border-outline-variant/20 rounded-2xl shadow-[0_32px_64px_rgba(0,0,0,0.7)] flex flex-col overflow-hidden max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant/10">
          <h2 className="text-lg font-headline font-bold text-on-surface">
            {snippet ? 'Edit Snippet' : 'New Snippet'}
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPreview(p => !p)}
              className="px-3 py-1.5 rounded-lg text-xs font-label bg-surface-container-highest hover:bg-surface-bright transition-colors text-on-surface-variant"
            >
              {preview ? 'Edit' : 'Preview'}
            </button>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-surface-container-highest transition-colors text-on-surface-variant">
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-[10px] font-label uppercase tracking-widest text-on-surface-variant mb-1.5">Title *</label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Fast I/O Template"
              className="w-full bg-surface-container-highest border border-outline-variant/20 rounded-lg px-4 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-1 focus:ring-primary/40 transition-all font-body"
            />
          </div>

          {/* Language & Tags Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-label uppercase tracking-widest text-on-surface-variant mb-1.5">Language</label>
              <select
                value={language}
                onChange={e => setLanguage(e.target.value)}
                className="w-full bg-surface-container-highest border border-outline-variant/20 rounded-lg px-4 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary/40 transition-all font-body appearance-none"
              >
                {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-label uppercase tracking-widest text-on-surface-variant mb-1.5">Tags (comma-separated)</label>
              <input
                value={tagsRaw}
                onChange={e => setTagsRaw(e.target.value)}
                placeholder="DP, graphs, binary search..."
                className="w-full bg-surface-container-highest border border-outline-variant/20 rounded-lg px-4 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-1 focus:ring-primary/40 transition-all font-body"
              />
            </div>
          </div>

          {/* Code area or Preview */}
          <div>
            <label className="block text-[10px] font-label uppercase tracking-widest text-on-surface-variant mb-1.5">Code *</label>
            {preview ? (
              <div className="rounded-lg overflow-hidden border border-outline-variant/20 text-sm">
                <SyntaxHighlighter language={language} style={oneDark} customStyle={{ margin: 0, borderRadius: 0, maxHeight: '360px' }}>
                  {code || '// nothing to preview'}
                </SyntaxHighlighter>
              </div>
            ) : (
              <textarea
                value={code}
                onChange={e => setCode(e.target.value)}
                rows={14}
                placeholder="Paste your code snippet here..."
                className="w-full bg-[#0e0d16] border border-outline-variant/20 rounded-lg px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/30 focus:outline-none focus:ring-1 focus:ring-primary/40 transition-all font-mono resize-none"
              />
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-outline-variant/10">
          <button onClick={onClose} className="px-4 py-2 text-sm font-label text-on-surface-variant hover:text-on-surface transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!title.trim() || !code.trim() || isSaving}
            className="px-5 py-2 bg-gradient-to-br from-primary to-primary-container text-on-primary-fixed font-semibold rounded-lg text-sm font-label disabled:opacity-40 hover:opacity-90 transition-all active:scale-[0.98] flex items-center gap-2"
          >
            {isSaving ? (
              <><span className="material-symbols-outlined text-base animate-spin">progress_activity</span> Saving...</>
            ) : (
              <><span className="material-symbols-outlined text-base">save</span> Save Snippet</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
