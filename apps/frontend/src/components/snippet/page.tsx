import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useSnippets } from '../../hooks/useSnippets';
import { SnippetCard } from './SnippetCard';
import { SnippetModal } from './SnippetModal';
import type { Snippet } from '../../types';

export function SnippetsPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { snippets, isLoading, createSnippet, updateSnippet, deleteSnippet } = useSnippets();

  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Snippet | null>(null);
  const [search, setSearch] = useState('');
  const [filterLang, setFilterLang] = useState('all');

  const openCreate = () => { setEditTarget(null); setModalOpen(true); };
  const openEdit = (s: Snippet) => { setEditTarget(s); setModalOpen(true); };

  const handleSave = async (data: Pick<Snippet, 'title' | 'code' | 'language' | 'tags'>) => {
    if (editTarget) {
      await updateSnippet(editTarget.id, data);
    } else {
      await createSnippet(data);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this snippet?')) return;
    await deleteSnippet(id);
  };

  const allLangs = ['all', ...Array.from(new Set(snippets.map(s => s.language)))];

  const filtered = snippets.filter(s => {
    const matchSearch = s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));
    const matchLang = filterLang === 'all' || s.language === filterLang;
    return matchSearch && matchLang;
  });

  return (
    <div className="bg-background text-on-background font-body h-screen w-full flex overflow-hidden">
      {/* Side Nav */}
      <aside className="h-screen w-64 fixed left-0 top-0 overflow-y-auto bg-[#13121c] shadow-[40px_0_40px_-20px_rgba(183,159,255,0.05)] flex flex-col py-6 z-50">
        <div className="px-6 mb-10">
          <h1 className="text-2xl font-bold text-[#b79fff] italic tracking-tighter font-headline cursor-pointer" onClick={() => navigate('/dashboard')}>CodeEra</h1>
          <p className="text-xs text-on-surface-variant font-label mt-1 opacity-60">Terminal v2.4</p>
        </div>
        <div className="px-4 mb-8">
          <button
            onClick={openCreate}
            className="w-full py-3 bg-gradient-to-br from-primary to-primary-container text-on-primary-fixed font-semibold rounded-lg flex items-center justify-center gap-2 hover:opacity-90 transition-all active:scale-[0.98]"
          >
            <span className="material-symbols-outlined text-lg">add</span>
            <span className="font-label text-sm">New Snippet</span>
          </button>
        </div>
        <nav className="flex-1 space-y-2">
          <a onClick={() => navigate('/dashboard')} className="flex items-center gap-3 px-4 py-3 text-[#f3effc]/60 hover:text-[#f3effc] transition-colors duration-200 hover:bg-[#2c2a39] cursor-pointer">
            <span className="material-symbols-outlined">code</span>
            <span className="font-headline tracking-tight">Problems</span>
          </a>
          {/* Library / Snippets - Active */}
          <div className="flex items-center gap-3 px-4 py-3 text-[#b79fff] bg-[#262431] rounded-r-full border-l-4 border-[#b79fff]">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>book_2</span>
            <span className="font-headline tracking-tight">Library</span>
          </div>

          <a className="flex items-center gap-3 px-4 py-3 text-[#f3effc]/60 hover:text-[#f3effc] transition-colors duration-200 hover:bg-[#2c2a39] cursor-pointer">
            <span className="material-symbols-outlined">trophy</span>
            <span className="font-headline tracking-tight">Contest</span>
          </a>
          <a className="flex items-center gap-3 px-4 py-3 text-[#f3effc]/60 hover:text-[#f3effc] transition-colors duration-200 hover:bg-[#2c2a39] cursor-pointer">
            <span className="material-symbols-outlined">monitoring</span>
            <span className="font-headline tracking-tight">Analytics</span>
          </a>
        </nav>
        <div className="mt-auto border-t border-outline-variant/10 pt-4 space-y-1">
          <a className="flex items-center gap-3 px-4 py-3 text-[#f3effc]/60 hover:text-[#f3effc] transition-colors duration-200 cursor-pointer">
            <span className="material-symbols-outlined">settings</span>
            <span className="font-headline tracking-tight">Settings</span>
          </a>
          <button onClick={logout} className="w-full flex items-center justify-start gap-3 px-4 py-3 text-error/60 hover:text-error transition-colors duration-200">
            <span className="material-symbols-outlined">logout</span>
            <span className="font-headline tracking-tight">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Area */}
      <div className="ml-64 flex flex-col w-full">
        {/* Top Bar */}
        <header className="fixed top-0 right-0 w-[calc(100%-16rem)] z-40 bg-[#0e0d16]/70 backdrop-blur-xl flex justify-between items-center px-8 h-16">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative group flex-1 max-w-sm">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg transition-colors group-focus-within:text-primary">search</span>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-surface-container-low border-none rounded-lg py-2 pl-10 pr-4 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:ring-1 focus:ring-primary/30 transition-all font-body outline-none"
                placeholder="Search snippets by title or tag..."
              />
            </div>
            {/* Language filter pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {allLangs.map(l => (
                <button
                  key={l}
                  onClick={() => setFilterLang(l)}
                  className={`px-3 py-1 rounded-full text-[10px] font-label uppercase tracking-widest transition-colors whitespace-nowrap ${filterLang === l ? 'bg-primary text-on-primary-fixed' : 'bg-surface-container-highest text-on-surface-variant hover:bg-surface-bright'}`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3 ml-6">
            <div className="text-right">
              <p className="text-sm font-semibold text-on-surface font-headline leading-tight">{user?.username}</p>
              <p className="text-[10px] text-primary-dim uppercase tracking-widest font-label">Member</p>
            </div>
            <img alt="User avatar" className="w-9 h-9 rounded-full border border-primary/20 p-0.5" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAf7D-GRwh6EVrrmVZPcTtcc2d004fR4RdIWjz6hZ73ZBxhtHmTyeXOqrZgsbAr_0KSCQt_HF1NyN9pIDXnfD8u2sRDeAuJpcVCH5ZYqgBqoo8hcVAQu-tl_fdaZpkVvTYILEQAN5EdnSUtDFe4M2brr6j6DOm2Hy0FJbHny5y9SO62DTEEukD_dWIvzrd6AMSvZgGd_-85q0RNeDeS54K0Qf1bFdrm76SknCQuvTsFpLXp44wg47J7G2AreRZgiMNz88hJksPUB2_i" />
          </div>
        </header>

        {/* Content */}
        <main className="mt-16 p-8 overflow-y-auto h-[calc(100vh-4rem)] custom-scrollbar">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <h2 className="text-3xl font-headline font-bold tracking-tight">Code Library</h2>
              <p className="text-on-surface-variant text-sm font-body mt-1">Your personal collection of reusable code snippets.</p>
            </div>
            <button
              onClick={openCreate}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-br from-primary to-primary-container text-on-primary-fixed font-semibold rounded-lg text-sm font-label hover:opacity-90 transition-all active:scale-[0.98] shadow-[0_0_16px_rgba(183,159,255,0.3)]"
            >
              <span className="material-symbols-outlined text-base">add</span>
              New Snippet
            </button>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center h-64 text-on-surface-variant">
              <span className="material-symbols-outlined animate-spin text-3xl mr-2">progress_activity</span> Loading snippets...
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-on-surface-variant gap-4">
              <span className="material-symbols-outlined text-6xl opacity-20">code_blocks</span>
              <p className="text-sm font-body">
                {search || filterLang !== 'all' ? 'No snippets match your search.' : 'No snippets yet. Create your first one!'}
              </p>
              {!search && filterLang === 'all' && (
                <button
                  onClick={openCreate}
                  className="px-4 py-2 bg-primary/10 border border-primary/20 text-primary rounded-lg text-sm font-label hover:bg-primary/20 transition-colors"
                >
                  + Create Snippet
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filtered.map(s => (
                <SnippetCard key={s.id} snippet={s} onEdit={openEdit} onDelete={handleDelete} />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Background Decoration */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[10%] left-[20%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[10%] right-[10%] w-[400px] h-[400px] bg-tertiary/5 rounded-full blur-[100px]"></div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <SnippetModal
          snippet={editTarget}
          onClose={() => setModalOpen(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
