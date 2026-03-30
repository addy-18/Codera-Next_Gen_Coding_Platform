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
  const easyCount = problems.filter(p => p.difficulty === 'Easy').length;
  const mediumCount = problems.filter(p => p.difficulty === 'Medium').length;
  const hardCount = problems.filter(p => p.difficulty === 'Hard').length;
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
          <a className="flex items-center gap-3 px-4 py-3 text-[#f3effc]/60 hover:text-[#f3effc] transition-colors duration-200 hover:bg-[#2c2a39]" href="#">
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

                <div className="bg-surface-container-low p-5 rounded-xl border-l-4 border-primary group hover:bg-surface-container transition-all cursor-pointer">
                  <div className="flex justify-between items-start mb-4">
                    <span className="material-symbols-outlined text-primary text-3xl" data-icon="calendar_today">calendar_today</span>
                    <span className="text-[10px] font-label font-bold bg-primary/10 text-primary px-2 py-1 rounded uppercase tracking-tighter">Active</span>
                  </div>
                  <h3 className="font-headline font-bold text-lg leading-tight mb-2">30 Days Coding Challenge</h3>
                  <div className="mt-4">
                    <div className="flex justify-between text-[10px] font-label text-on-surface-variant mb-1 uppercase tracking-wider">
                      <span>Progress</span>
                      <span>18/30 Days</span>
                    </div>
                    <div className="w-full bg-surface-container-highest h-1.5 rounded-full overflow-hidden">
                      <div className="bg-primary h-full w-[60%] rounded-full shadow-[0_0_8px_rgba(183,159,255,0.6)]"></div>
                    </div>
                  </div>
                </div>
                {/*// Card 2
                <div className="bg-surface-container-low p-5 rounded-xl border-l-4 border-tertiary group hover:bg-surface-container transition-all cursor-pointer">
                  <div className="flex justify-between items-start mb-4">
                    <span className="material-symbols-outlined text-tertiary text-3xl" data-icon="work">work</span>
                    <span className="text-[10px] font-label font-bold bg-tertiary/10 text-tertiary px-2 py-1 rounded uppercase tracking-tighter">Popular</span>
                  </div>
                  <h3 className="font-headline font-bold text-lg leading-tight mb-2">Top Interview Questions</h3>
                  <div className="mt-4">
                    <div className="flex justify-between text-[10px] font-label text-on-surface-variant mb-1 uppercase tracking-wider">
                      <span>Completed</span>
                      <span>84/150</span>
                    </div>
                    <div className="w-full bg-surface-container-highest h-1.5 rounded-full overflow-hidden">
                      <div className="bg-tertiary h-full w-[56%] rounded-full shadow-[0_0_8px_rgba(255,242,171,0.4)]"></div>
                    </div>
                  </div>
                </div>*/}
                {/* Card */}
                <div className="bg-surface-container-low p-5 rounded-xl border-l-4 border-error group hover:bg-surface-container transition-all cursor-pointer">
                  <div className="flex justify-between items-start mb-4">
                    <span className="material-symbols-outlined text-error text-3xl" data-icon="psychology">psychology</span>
                    <span className="text-[10px] font-label font-bold bg-error/10 text-error px-2 py-1 rounded uppercase tracking-tighter">Mastery</span>
                  </div>
                  <h3 className="font-headline font-bold text-lg leading-tight mb-2">Dynamic Programming</h3>
                  <div className="mt-4">
                    <div className="flex justify-between text-[10px] font-label text-on-surface-variant mb-1 uppercase tracking-wider">
                      <span>Proficiency</span>
                      <span>42%</span>
                    </div>
                    <div className="w-full bg-surface-container-highest h-1.5 rounded-full overflow-hidden">
                      <div className="bg-error h-full w-[42%] rounded-full shadow-[0_0_8px_rgba(255,110,132,0.4)]"></div>
                    </div>
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

          {/* Right Column: Analytics & Stats */}
          <div className="w-full lg:w-80 space-y-8">
            {/* Progress Circle Card */}
            <div className="bg-surface-container-low p-6 rounded-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-primary/10 transition-colors"></div>
              <h3 className="font-headline font-bold text-sm mb-6 uppercase tracking-widest text-on-surface-variant">Overall Progress</h3>
              <div className="flex flex-col items-center">
                <div className="relative w-40 h-40">
                  {/* SVG Progress Ring */}
                  <svg className="w-full h-full transform -rotate-90">
                    <circle className="text-surface-container-highest" cx="80" cy="80" fill="transparent" r="70" stroke="currentColor" strokeWidth="8"></circle>
                    <circle className="text-primary shadow-glow" cx="80" cy="80" fill="transparent" r="70" stroke="currentColor" strokeDasharray="440" strokeDashoffset="380" strokeWidth="8"></circle>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-headline font-bold">24</span>
                    <span className="text-[10px] text-on-surface-variant uppercase tracking-tighter">Solved</span>
                  </div>
                </div>
                <div className="mt-6 w-full space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-primary font-bold">Easy</span>
                    <span className="text-on-surface">1 / {easyCount}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-tertiary font-bold">Med.</span>
                    <span className="text-on-surface">1 / {mediumCount}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-error font-bold">Hard</span>
                    <span className="text-on-surface">0 / {hardCount}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Daily Heatmap Tracker */}
            <div className="bg-surface-container-low p-6 rounded-xl">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-headline font-bold text-sm uppercase tracking-widest text-on-surface-variant">Activity Heatmap</h3>
                <div className="flex items-center gap-1 text-primary">
                  <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>local_fire_department</span>
                  <span className="text-xs font-bold font-headline">12 Day Streak</span>
                </div>
              </div>
              <div className="grid grid-cols-7 gap-1.5">
                {/* Simplified Heatmap Mock */}
                {[...Array(28)].map((_, i) => {
                  const val = [0, 20, 40, 60, 80, 100][Math.floor(Math.random() * 6)];
                  const bgClass = val === 0 ? 'bg-surface-container-highest' :
                    val === 20 ? 'bg-primary/20' :
                      val === 40 ? 'bg-primary/40' :
                        val === 60 ? 'bg-primary/60' :
                          val === 80 ? 'bg-primary/80' :
                            'bg-primary shadow-[0_0_5px_rgba(183,159,255,0.4)]';
                  return <div key={i} className={`aspect-square rounded-sm ${bgClass}`}></div>;
                })}
              </div>
              <div className="mt-4 flex justify-between text-[8px] font-label text-on-surface-variant uppercase tracking-widest">
                <span>Less</span>
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-surface-container-highest rounded-sm"></div>
                  <div className="w-2 h-2 bg-primary/20 rounded-sm"></div>
                  <div className="w-2 h-2 bg-primary/40 rounded-sm"></div>
                  <div className="w-2 h-2 bg-primary/60 rounded-sm"></div>
                  <div className="w-2 h-2 bg-primary rounded-sm"></div>
                </div>
                <span>More</span>
              </div>
            </div>
          </div>
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
