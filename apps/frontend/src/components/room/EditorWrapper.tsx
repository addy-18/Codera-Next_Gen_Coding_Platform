import Editor from '@monaco-editor/react';
import { Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRef, useEffect } from 'react';

export const LANGUAGES = [
  { id: 71, name: 'Python', monaco: 'python' },
  { id: 63, name: 'JavaScript', monaco: 'javascript' },
  { id: 54, name: 'C++', monaco: 'cpp' },
  { id: 62, name: 'Java', monaco: 'java' },
];

interface EditorWrapperProps {
  content: string;
  languageId: number;
  canEdit: boolean;
  onChange: (value: string) => void;
  onLanguageChange: (id: number) => void;
  onCursorChange?: (position: any) => void;
  remoteCursors?: Record<string, { position: any, color: string, username: string }>;
}

export function EditorWrapper({ content, languageId, canEdit, onChange, onLanguageChange, onCursorChange, remoteCursors = {} }: EditorWrapperProps) {
  const selectedLang = LANGUAGES.find(l => l.id === languageId);
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<any>(null);
  const decorationsRef = useRef<any>(null);

  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
    decorationsRef.current = editor.createDecorationsCollection([]);

    editor.onDidChangeCursorPosition((e: any) => {
      onCursorChange?.(e.position);
    });
  };

  useEffect(() => {
    if (!editorRef.current || !decorationsRef.current || !monacoRef.current) return;
    
    const newDecorations = Object.entries(remoteCursors).map(([userId, cursor]) => {
      return {
        range: new monacoRef.current.Range(cursor.position.lineNumber, cursor.position.column, cursor.position.lineNumber, cursor.position.column),
        options: {
          className: `remote-cursor-${userId}`,
          hoverMessage: { value: cursor.username },
          before: {
            content: '\u200b',
            inlineClassName: `remote-caret-${userId}`
          }
        }
      };
    });

    decorationsRef.current.set(newDecorations);
  }, [remoteCursors]);

  return (
    <div className="flex-1 flex flex-col relative bg-base" style={{ minHeight: 0 }}>
      <style>
        {Object.entries(remoteCursors).map(([userId, cursor]) => `
          .remote-caret-${userId} {
            border-left: 2px solid ${cursor.color};
            margin-left: -1px;
            position: absolute;
            height: 100%;
            pointer-events: none;
            z-index: 10;
          }
          .remote-caret-${userId}::after {
            content: '${cursor.username}';
            position: absolute;
            top: -18px;
            left: 0;
            background: ${cursor.color};
            color: #000;
            font-size: 10px;
            font-family: sans-serif;
            padding: 1px 4px;
            border-radius: 2px;
            white-space: nowrap;
            pointer-events: none;
            opacity: 0;
            transition: opacity 0.2s;
            line-height: normal;
          }
          .remote-caret-${userId}:hover::after {
            opacity: 1;
          }
        `).join('\n')}
      </style>
      
      {/* Editor Header / Language Selector */}
      <div className="h-10 bg-surface border-b border-border flex items-center px-4 shrink-0 justify-between">
        <select
          value={languageId}
          onChange={(e) => onLanguageChange(Number(e.target.value))}
          disabled={!canEdit}
          className="bg-elevated text-text-main text-xs px-2.5 py-1.5 rounded border border-border focus:outline-none focus:border-primary transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {LANGUAGES.map(lang => (
            <option key={lang.id} value={lang.id}>{lang.name}</option>
          ))}
        </select>
        
        {/* Editor Tabs or file name */}
        <div className="flex items-center">
          <div className="px-4 py-1.5 bg-elevated border-t-2 border-primary text-xs font-mono text-text-main rounded-t-sm">
             main.{selectedLang?.monaco === 'python' ? 'py' : selectedLang?.monaco === 'cpp' ? 'cpp' : selectedLang?.monaco === 'java' ? 'java' : 'js'}
          </div>
        </div>
      </div>

      {/* Editor area — absolute inner to give Monaco a concrete height */}
      <div className="flex-1 relative" style={{ minHeight: 1000 }}>
        <div className="absolute inset-0">
          <Editor
            height="100%"
            language={selectedLang?.monaco || 'python'}
            theme="vs-dark"
            value={content}
            onMount={handleEditorDidMount}
            onChange={(value) => {
              if (canEdit) onChange(value || '');
            }}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              fontFamily: "'JetBrains Mono', 'Fira Code', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
              fontLigatures: true,
              automaticLayout: true,
              scrollBeyondLastLine: false,
              padding: { top: 24, bottom: 24 },
              readOnly: false,
              cursorBlinking: 'smooth',
              cursorSmoothCaretAnimation: "on",
              renderWhitespace: 'selection',
              lineHeight: 24,
            }}
          />
        </div>

        {/* Read-only badge (no blur — content stays fully visible) */}
        <AnimatePresence>
          {!canEdit && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-3 left-1/2 -translate-x-1/2 z-10 pointer-events-none"
            >
              <div className="px-4 py-2 bg-elevated/95 border border-white/10 rounded-full shadow-soft flex items-center gap-2 text-sm font-medium text-muted">
                <Lock className="w-4 h-4 text-accent" /> Read-only mode
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
