import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../hooks/useAuth';
import type { Problem } from '../types';

export function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [problems, setProblems] = useState<Problem[]>([]);

  useEffect(() => {
    api.get('/problems')
      .then((res) => setProblems(res.data))
      .catch((err) => console.error(err));
  }, []);

  // Quick stats derived from problem length (Mocked for visual parity)
  // const easyCount = problems.filter(p => p.difficulty === 'Easy').length;
  // const mediumCount = problems.filter(p => p.difficulty === 'Medium').length;
  // const hardCount = problems.filter(p => p.difficulty === 'Hard').length;
  const totalCount = problems.length;

  return (
    <div className="bg-background text-on-background font-body selection:bg-primary/30 selection:text-primary overflow-hidden h-screen w-full flex">
      {/* SideNavBar Component */}
      <aside className="h-screen w-64 fixed left-0 top-0 overflow-y-auto bg-[#13121c] dark:bg-[#13121c] shadow-[40px_0_40px_-20px_rgba(183,159,255,0.05)] flex flex-col py-6 z-50">
        <div className="px-6 mb-10">
          <h1 className="text-2xl font-bold text-[#b79fff] italic tracking-tighter font-headline cursor-pointer" onClick={() => navigate('/')}>CodeEra</h1>
          <p className="text-xs text-on-surface-variant font-label mt-1 opacity-60">Terminal v2.4</p>
        </div>
        <div className="px-4 mb-8">
          <button
            onClick={() => navigate('/snippets')}
            className="w-full py-3 bg-gradient-to-br from-primary to-primary-container text-on-primary-fixed font-semibold rounded-lg flex items-center justify-center gap-2 hover:opacity-90 transition-all active:scale-[0.98]">
            <span className="material-symbols-outlined text-lg">add</span>
            <span className="font-label text-sm">New Snippet</span>
          </button>
        </div>
        <nav className="flex-1 space-y-2">
          {/* Problems Tab (Active) */}
          <a className="flex items-center gap-3 px-4 py-3 text-[#b79fff] bg-[#262431] rounded-r-full border-l-4 border-[#b79fff] transition-all duration-300" href="#">
            <span className="material-symbols-outlined" data-icon="code" style={{ fontVariationSettings: "'FILL' 1" }}>code</span>
            <span className="font-headline tracking-tight">Problems</span>
          </a>
          {/* Library Tab */}
          <a onClick={() => navigate('/snippets')} className="flex items-center gap-3 px-4 py-3 text-[#f3effc]/60 hover:text-[#f3effc] transition-colors duration-200 hover:bg-[#2c2a39] cursor-pointer">
            <span className="material-symbols-outlined" data-icon="book_2">book_2</span>
            <span className="font-headline tracking-tight">Library</span>
          </a>
          {/* Contest Tab */}
          <a className="flex items-center gap-3 px-4 py-3 text-[#f3effc]/60 hover:text-[#f3effc] transition-colors duration-200 hover:bg-[#2c2a39]" href="#">
            <span className="material-symbols-outlined" data-icon="trophy">trophy</span>
            <span className="font-headline tracking-tight">Contest</span>
          </a>
          {/* Analytics Tab */}
          <a onClick={() => navigate('/analytics')} className="flex items-center gap-3 px-4 py-3 text-[#f3effc]/60 hover:text-[#f3effc] transition-colors duration-200 hover:bg-[#2c2a39] cursor-pointer">
            <span className="material-symbols-outlined" data-icon="monitoring">monitoring</span>
            <span className="font-headline tracking-tight">Analytics</span>
          </a>
        </nav>
        <div className="mt-auto border-t border-outline-variant/10 pt-4 space-y-1">
          <a className="flex items-center gap-3 px-4 py-3 text-[#f3effc]/60 hover:text-[#f3effc] transition-colors duration-200" href="#">
            <span className="material-symbols-outlined" data-icon="settings">settings</span>
            <span className="font-headline tracking-tight">Settings</span>
          </a>
          <button onClick={logout} className="w-full flex items-center justify-start gap-3 px-4 py-3 text-error/60 hover:text-error transition-colors duration-200">
            <span className="material-symbols-outlined" data-icon="logout">logout</span>
            <span className="font-headline tracking-tight">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="ml-64 flex flex-col min-h-screen w-full relative z-10">
        {/* TopAppBar Component */}
        <header className="fixed top-0 right-0 w-[calc(100%-16rem)] z-40 bg-[#0e0d16]/70 backdrop-blur-xl flex justify-between items-center px-8 h-16">
          <div className="flex-1 max-w-xl">
            <div className="relative group">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg transition-colors group-focus-within:text-primary">search</span>
              <input className="w-full bg-surface-container-low border-none rounded-lg py-2 pl-10 pr-4 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:ring-1 focus:ring-primary/30 transition-all font-body outline-none" placeholder="Search problems, topics, users..." type="text" />
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4">
              <button className="p-2 text-on-surface-variant hover:text-primary transition-colors relative">
                <span className="material-symbols-outlined" data-icon="notifications">notifications</span>
                <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border-2 border-background"></span>
              </button>
              <button className="p-2 text-on-surface-variant hover:text-primary transition-colors">
                <span className="material-symbols-outlined" data-icon="terminal">terminal</span>
              </button>
            </div>
            <div className="h-8 w-[1px] bg-outline-variant/20 mx-2"></div>
            <div className="flex items-center gap-3 cursor-pointer group">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-on-surface font-headline leading-tight">{user?.username || 'neo_coder'}</p>
                <p className="text-[10px] text-primary-dim uppercase tracking-widest font-label">Member</p>
              </div>
              <img alt="User avatar" className="w-9 h-9 rounded-full border border-primary/20 p-0.5 group-hover:border-primary transition-colors" data-alt="Cyberpunk style user profile avatar" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAf7D-GRwh6EVrrmVZPcTtcc2d004fR4RdIWjz6hZ73ZBxhtHmTyeXOqrZgsbAr_0KSCQt_HF1NyN9pIDXnfD8u2sRDeAuJpcVCH5ZYqgBqoo8hcVAQu-tl_fdaZpkVvTYILEQAN5EdnSUtDFe4M2brr6j6DOm2Hy0FJbHny5y9SO62DTEEukD_dWIvzrd6AMSvZgGd_-85q0RNeDeS54K0Qf1bFdrm76SknCQuvTsFpLXp44wg47J7G2AreRZgiMNz88hJksPUB2_i" />
            </div>
          </div>
        </header>

        {/* Dashboard Canvas */}
        <main className="mt-16 p-8 flex flex-col lg:flex-row gap-8 overflow-y-auto custom-scrollbar h-[calc(100vh-4rem)]">
          {/* Left Column: Primary Dashboard Content */}
          <div className="flex-1 space-y-10">
            {/* Hero/Promotion Cards */}

            <section>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div onClick={() => navigate('/analytics')} className="bg-gradient-to-br from-surface-container-low to-primary/5 p-8 rounded-xl border border-primary/20 group hover:border-primary/50 transition-all cursor-pointer relative overflow-hidden flex items-center justify-between">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-colors"></div>
                  <div>
                    <h3 className="font-headline font-bold text-2xl leading-tight mb-2 flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary">monitoring</span>
                      Performance Analytics
                    </h3>
                    <p className="text-on-surface-variant font-body mb-4">Track execution speed, analyze complexity, and visualize your progress.</p>
                    <button className="text-[12px] font-label font-bold bg-primary/10 text-primary px-4 py-2 rounded uppercase tracking-tighter hover:bg-primary/20 transition-colors">
                      View Detailed Dashboard
                    </button>
                  </div>
                  <div className="hidden lg:block material-symbols-outlined text-6xl text-primary/20 group-hover:text-primary transition-colors group-hover:pr-4">
                    arrow_forward
                  </div>
                </div>
              </div>
            </section>


            {/* Problem List Section */}
            <section className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-end gap-4">
                <div>
                  <h2 className="text-3xl font-headline font-bold tracking-tight">Problem Set</h2>
                  <p className="text-on-surface-variant text-sm font-body">Algorithm mastery requires consistent iteration.</p>
                </div>
                <div className="flex gap-2">
                  <button className="flex items-center gap-2 px-4 py-2 bg-surface-container-highest rounded-lg text-xs font-label hover:bg-surface-bright transition-colors border border-outline-variant/10">
                    <span className="material-symbols-outlined text-sm">filter_list</span>
                    Filter
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 bg-surface-container-highest rounded-lg text-xs font-label hover:bg-surface-bright transition-colors border border-outline-variant/10">
                    <span className="material-symbols-outlined text-sm">swap_vert</span>
                    Difficulty
                  </button>
                </div>
              </div>
              <div className="bg-surface-container-low rounded-xl overflow-hidden shadow-2xl">
                <table className="w-full text-left font-body">
                  <thead>
                    <tr className="text-[10px] uppercase tracking-widest text-on-surface-variant bg-surface-container-highest/50">
                      <th className="px-6 py-4 font-label">Status</th>
                      <th className="px-6 py-4 font-label">Title</th>
                      <th className="px-6 py-4 font-label">Difficulty</th>
                      <th className="px-6 py-4 font-label">Acceptance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/5">
                    {problems.map((problem) => {
                      const numberId = problem.id.replace('problem_', '');
                      const difficultyColor =
                        problem.difficulty === 'Easy' ? 'text-primary bg-primary/10' :
                          problem.difficulty === 'Medium' ? 'text-tertiary bg-tertiary/10' :
                            'text-error bg-error/10';

                      return (
                        <tr key={problem.id} onClick={() => navigate(`/problems/${problem.id}`)} className="hover:bg-surface-bright/50 transition-colors group cursor-pointer">
                          <td className="px-6 py-5">
                            <span className="material-symbols-outlined text-on-surface-variant/20" data-icon="radio_button_unchecked">radio_button_unchecked</span>
                          </td>
                          <td className="px-6 py-5">
                            <div className="font-medium text-on-surface group-hover:text-primary transition-colors">{numberId}. {problem.name}</div>
                            <div className="text-[10px] text-on-surface-variant/60 flex gap-2 mt-1">
                              <span>#Algorithm</span>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <span className={`text-[10px] font-label font-bold px-2 py-1 rounded ${difficultyColor}`}>
                              {problem.difficulty.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-6 py-5 text-sm text-on-surface-variant">50.0%</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                <div className="p-4 bg-surface-container-highest/30 flex justify-center">
                  <button className="text-xs font-label text-primary hover:underline underline-offset-4 tracking-widest uppercase">View All {totalCount} Problems</button>
                </div>
              </div>
            </section>
          </div>
          {/* We removed the Right Column because detailed analytics are now housed safely on the UserDashboard */}
        </main>
      </div>

      {/* Background Decoration */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[10%] left-[20%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[10%] right-[10%] w-[400px] h-[400px] bg-tertiary/5 rounded-full blur-[100px]"></div>
      </div>
    </div>
  );
}
