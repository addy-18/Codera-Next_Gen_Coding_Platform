import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { api } from '../lib/api';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts';

export function UserDashboard() {
  const { user, logout, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState<any>(null);
  const [trends, setTrends] = useState<any[]>([]);
  const [problems, setProblems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    setError(null);

    const fetchAnalytics = async () => {
      try {
        const [statsRes, trendsRes, problemsRes] = await Promise.all([
          api.get(`/analytics/${user.id}`),
          api.get(`/analytics/${user.id}/trends`),
          api.get(`/analytics/${user.id}/problems`),
        ]);
        setAnalytics(statsRes.data);
        setTrends(trendsRes.data);
        setProblems(problemsRes.data);
      } catch (err: any) {
        console.error('Failed to load analytics', err);
        const msg = err?.response?.data?.error || err?.message || 'Failed to load analytics.';
        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [user]);

  const difficultyData = [
    { name: 'Easy', value: analytics?.difficultyBreakdown?.easy ?? analytics?.easySolved ?? 0, color: '#b79fff' },
    { name: 'Medium', value: analytics?.difficultyBreakdown?.medium ?? analytics?.mediumSolved ?? 0, color: '#fff2ab' },
    { name: 'Hard', value: analytics?.difficultyBreakdown?.hard ?? analytics?.hardSolved ?? 0, color: '#ff6e84' },
  ];

  const Sidebar = () => (
    <aside className="h-screen w-64 fixed left-0 top-0 overflow-y-auto bg-[#13121c] shadow-[40px_0_40px_-20px_rgba(183,159,255,0.05)] flex flex-col py-6 z-50">
      <div className="px-6 mb-10">
        <h1
          className="text-2xl font-bold text-[#b79fff] italic tracking-tighter font-headline cursor-pointer"
          onClick={() => navigate('/')}
        >
          CodeEra
        </h1>
        <p className="text-xs text-on-surface-variant font-label mt-1 opacity-60">Analytics Engine</p>
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
        <a
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-3 px-4 py-3 text-[#f3effc]/60 hover:text-[#f3effc] transition-colors duration-200 hover:bg-[#2c2a39] cursor-pointer"
        >
          <span className="material-symbols-outlined">code</span>
          <span className="font-headline tracking-tight">Problems</span>
        </a>
        <a
          onClick={() => navigate('/snippets')}
          className="flex items-center gap-3 px-4 py-3 text-[#f3effc]/60 hover:text-[#f3effc] transition-colors duration-200 hover:bg-[#2c2a39] cursor-pointer"
        >
          <span className="material-symbols-outlined">book_2</span>
          <span className="font-headline tracking-tight">Library</span>
        </a>
        <a
          onClick={() => navigate('/contests')}
          className="flex items-center gap-3 px-4 py-3 text-[#f3effc]/60 hover:text-[#f3effc] transition-colors duration-200 hover:bg-[#2c2a39] cursor-pointer"
        >
          <span className="material-symbols-outlined">trophy</span>
          <span className="font-headline tracking-tight">Contests</span>
        </a>
        <a className="flex items-center gap-3 px-4 py-3 text-[#b79fff] bg-[#262431] rounded-r-full border-l-4 border-[#b79fff] transition-all duration-300">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>monitoring</span>
          <span className="font-headline tracking-tight">Analytics</span>
        </a>
      </nav>
      <div className="mt-auto border-t border-outline-variant/10 pt-4">
        <button
          onClick={logout}
          className="w-full flex items-center justify-start gap-3 px-4 py-3 text-error/60 hover:text-error transition-colors duration-200"
        >
          <span className="material-symbols-outlined">logout</span>
          <span className="font-headline tracking-tight">Sign Out</span>
        </button>
      </div>
    </aside>
  );

  // ── Auth loading screen ──
  if (authLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#0e0d16]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-[#b79fff] border-t-transparent animate-spin" />
          <p className="text-[#b79fff] text-sm font-label">Authenticating...</p>
        </div>
      </div>
    );
  }

  // ── Analytics loading screen ──
  if (loading) {
    return (
      <div className="bg-[#0e0d16] text-on-background h-screen w-full flex overflow-hidden">
        <Sidebar />
        <div className="ml-64 flex flex-col w-full h-full overflow-y-auto">
          <header className="bg-[#0e0d16]/70 backdrop-blur-xl flex justify-between items-center px-8 h-16 shrink-0 sticky top-0 z-40 border-b border-outline-variant/10">
            <h2 className="text-xl font-headline font-bold text-on-surface">Performance Dashboard</h2>
          </header>
          <main className="p-8 space-y-8 flex-1">
            {/* Skeleton stat cards */}
            <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-surface-container-low p-6 rounded-xl border border-outline-variant/20 animate-pulse flex flex-col gap-3">
                  <div className="h-3 w-24 bg-outline-variant/30 rounded" />
                  <div className="h-8 w-16 bg-outline-variant/20 rounded" />
                </div>
              ))}
            </section>
            {/* Skeleton charts */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-80">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="bg-surface-container-low p-6 rounded-xl border border-outline-variant/20 animate-pulse flex flex-col gap-4">
                  <div className="h-3 w-32 bg-outline-variant/30 rounded" />
                  <div className="flex-1 bg-outline-variant/10 rounded-lg" />
                </div>
              ))}
            </section>
          </main>
        </div>
      </div>
    );
  }

  // ── Error screen ──
  if (error) {
    return (
      <div className="bg-[#0e0d16] text-on-background h-screen w-full flex overflow-hidden">
        <Sidebar />
        <div className="ml-64 flex flex-col w-full h-full overflow-y-auto">
          <header className="bg-[#0e0d16]/70 backdrop-blur-xl flex justify-between items-center px-8 h-16 shrink-0 sticky top-0 z-40 border-b border-outline-variant/10">
            <h2 className="text-xl font-headline font-bold text-on-surface">Performance Dashboard</h2>
          </header>
          <main className="p-8 flex items-center justify-center flex-1">
            <div className="flex flex-col items-center gap-4 text-center max-w-md">
              <span className="material-symbols-outlined text-error text-5xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                error_circle
              </span>
              <h3 className="text-lg font-headline font-bold text-on-surface">Failed to Load Analytics</h3>
              <p className="text-sm text-on-surface-variant">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-2 px-5 py-2 rounded-lg bg-primary/10 text-primary border border-primary/30 hover:bg-primary/20 transition-colors text-sm font-label"
              >
                Try Again
              </button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#0e0d16] text-on-background font-body h-screen w-full flex overflow-hidden">
      <Sidebar />

      {/* Main Content Area */}
      <div className="ml-64 flex flex-col w-full h-full overflow-y-auto">
        <header className="bg-[#0e0d16]/70 backdrop-blur-xl flex justify-between items-center px-8 h-16 shrink-0 sticky top-0 z-40 border-b border-outline-variant/10">
          <h2 className="text-xl font-headline font-bold text-on-surface">Performance Dashboard</h2>
          {user && (
            <span className="text-sm text-on-surface-variant font-label opacity-60">
              @{user.username}
            </span>
          )}
        </header>

        <main className="p-8 space-y-8 flex-1">
          {/* Overview Cards */}
          <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-surface-container-low p-6 rounded-xl border border-outline-variant/20 hover:border-primary/30 transition-all flex flex-col">
              <span className="text-xs font-label uppercase tracking-widest text-on-surface-variant mb-2">Acceptance Rate</span>
              <span className="text-3xl font-headline font-bold text-primary">
                {(analytics?.acceptanceRate ?? 0).toFixed(1)}%
              </span>
            </div>
            <div className="bg-surface-container-low p-6 rounded-xl border border-outline-variant/20 hover:border-tertiary/30 transition-all flex flex-col">
              <span className="text-xs font-label uppercase tracking-widest text-on-surface-variant mb-2">Problems Solved</span>
              <span className="text-3xl font-headline font-bold text-tertiary">
                {analytics?.problemsSolved ?? 0}
              </span>
            </div>
            <div className="bg-surface-container-low p-6 rounded-xl border border-outline-variant/20 hover:border-success/30 transition-all flex flex-col">
              <span className="text-xs font-label uppercase tracking-widest text-on-surface-variant mb-2">Avg Runtime</span>
              <span className="text-3xl font-headline font-bold text-success">
                {(analytics?.avgRuntime ?? 0).toFixed(2)}ms
              </span>
            </div>
            <div className="bg-surface-container-low p-6 rounded-xl border border-outline-variant/20 hover:border-error/30 transition-all flex flex-col">
              <span className="text-xs font-label uppercase tracking-widest text-on-surface-variant mb-2">Current Streak</span>
              <div className="flex items-center gap-2">
                <span
                  className="material-symbols-outlined text-error"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  local_fire_department
                </span>
                <span className="text-3xl font-headline font-bold text-error">
                  {analytics?.streak ?? 0}
                </span>
              </div>
            </div>
          </section>

          {/* Total Submissions helper stat */}
          {analytics && (
            <div className="flex gap-6 text-sm text-on-surface-variant font-label px-1">
              <span>Total Submissions: <span className="text-on-surface font-bold">{analytics.totalSubmissions ?? 0}</span></span>
              <span>Accepted: <span className="text-primary font-bold">{analytics.acceptedSubmissions ?? 0}</span></span>
              <span>Easy: <span className="text-[#b79fff] font-bold">{analytics.easySolved ?? 0}</span></span>
              <span>Medium: <span className="text-[#fff2ab] font-bold">{analytics.mediumSolved ?? 0}</span></span>
              <span>Hard: <span className="text-[#ff6e84] font-bold">{analytics.hardSolved ?? 0}</span></span>
            </div>
          )}

          {/* Charts Row */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-8" style={{ height: '320px' }}>
            {/* Submissions Trend */}
            <div className="bg-surface-container-low p-6 rounded-xl border border-outline-variant/20 flex flex-col">
              <h3 className="text-sm font-headline font-bold uppercase tracking-widest text-on-surface-variant mb-4">
                Submission Trends (Last 30 Days)
              </h3>
              <div className="flex-1 min-h-0">
                {trends.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-on-surface-variant/50 gap-2">
                    <span className="material-symbols-outlined text-3xl opacity-40">show_chart</span>
                    <p className="text-xs font-label">No activity data yet</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trends}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#484751" opacity={0.2} />
                      <XAxis
                        dataKey="date"
                        stroke="#908f9c"
                        fontSize={10}
                        tickFormatter={(tick) => tick.split('-').slice(1).join('/')}
                      />
                      <YAxis stroke="#908f9c" fontSize={10} allowDecimals={false} />
                      <RechartsTooltip
                        contentStyle={{ backgroundColor: '#13121c', borderColor: '#484751', borderRadius: '8px' }}
                        labelFormatter={(label) => `Date: ${label}`}
                      />
                      <Line
                        type="monotone"
                        dataKey="submissionsCount"
                        name="Submissions"
                        stroke="#b79fff"
                        strokeWidth={3}
                        dot={{ r: 4, fill: '#b79fff' }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Difficulty Breakdown */}
            <div className="bg-surface-container-low p-6 rounded-xl border border-outline-variant/20 flex flex-col">
              <h3 className="text-sm font-headline font-bold uppercase tracking-widest text-on-surface-variant mb-4">
                Difficulty Breakdown
              </h3>
              <div className="flex-1 min-h-0 flex items-center">
                {difficultyData.every(d => d.value === 0) ? (
                  <div className="w-full h-full flex flex-col items-center justify-center text-on-surface-variant/50 gap-2">
                    <span className="material-symbols-outlined text-3xl opacity-40">bar_chart</span>
                    <p className="text-xs font-label">No solved problems yet</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={difficultyData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#484751" opacity={0.2} />
                      <XAxis type="number" stroke="#908f9c" fontSize={10} allowDecimals={false} />
                      <YAxis dataKey="name" type="category" stroke="#908f9c" fontSize={10} width={60} />
                      <RechartsTooltip
                        contentStyle={{ backgroundColor: '#13121c', borderColor: '#484751', borderRadius: '8px' }}
                        cursor={{ fill: 'rgba(183, 159, 255, 0.05)' }}
                      />
                      <Bar dataKey="value" name="Problems Solved" radius={[0, 4, 4, 0]}>
                        {difficultyData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </section>

          {/* Detailed Problem Log Table */}
          <section className="bg-surface-container-low p-6 rounded-xl border border-outline-variant/20 shadow-2xl">
            <h3 className="text-sm font-headline font-bold uppercase tracking-widest text-on-surface-variant mb-6">
              Recent Submissions Log
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left font-body text-sm">
                <thead>
                  <tr className="text-[10px] uppercase tracking-widest text-on-surface-variant border-b border-outline-variant/20">
                    <th className="pb-4 pr-6">Status</th>
                    <th className="pb-4 px-6">Problem ID</th>
                    <th className="pb-4 px-6 text-right">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/5">
                  {problems.slice(0, 20).map((prob, idx) => {
                    const verdict = prob.verdict || prob.status || 'Pending';
                    const isAc = verdict === 'Accepted' || verdict === 'AC';
                    const statusColor = isAc ? 'text-primary bg-primary/10' : 'text-error bg-error/10';

                    return (
                      <tr key={prob.id ?? idx} className="hover:bg-surface-bright/30 transition-colors">
                        <td className="py-4 pr-6">
                          <span className={`text-[10px] font-label font-bold px-2 py-1 rounded ${statusColor}`}>
                            {verdict}
                          </span>
                        </td>
                        <td className="py-4 px-6 font-mono text-on-surface-variant text-xs">{prob.problemId}</td>
                        <td className="py-4 px-6 text-right text-on-surface-variant/60 text-xs">
                          {new Date(prob.createdAt).toLocaleDateString(undefined, {
                            year: 'numeric', month: 'short', day: 'numeric',
                          })}
                        </td>
                      </tr>
                    );
                  })}
                  {problems.length === 0 && (
                    <tr>
                      <td colSpan={3} className="py-12 text-center">
                        <div className="flex flex-col items-center gap-2 text-on-surface-variant/50">
                          <span className="material-symbols-outlined text-3xl opacity-40">history</span>
                          <p className="text-sm font-label">No submissions yet. Start solving problems!</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
