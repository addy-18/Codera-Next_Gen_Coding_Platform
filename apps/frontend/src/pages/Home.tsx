import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { motion } from 'framer-motion';

export function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Redirect to dashboard if logged in
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  return (
    <div className="bg-surface text-on-surface font-body selection:bg-primary selection:text-on-primary overflow-x-hidden min-h-screen relative">
      <style>{`
        .material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
        .neon-glow {
            text-shadow: 0 0 15px rgba(183, 159, 255, 0.4);
        }
        .bloom-shadow {
            box-shadow: 0 20px 40px rgba(183, 159, 255, 0.1);
        }
        .glass-panel {
            background: rgba(32, 30, 42, 0.7);
            backdrop-filter: blur(20px);
        }
      `}</style>

      {/* TopNavBar */}
      <nav className="fixed top-0 w-full z-50 bg-[#13121c]/70 backdrop-blur-xl shadow-[0_20px_40px_rgba(183,159,255,0.1)]">
        <div className="flex justify-between items-center h-16 px-8 max-w-screen-2xl mx-auto">
          <div className="text-2xl font-bold tracking-tighter text-[#f3effc] font-headline cursor-pointer" onClick={() => navigate('/')}>CodeEra</div>
          <div className="hidden md:flex items-center space-gap-8 gap-8">
            <a onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="text-[#b79fff] border-b-2 border-[#b79fff] pb-1 font-label text-sm cursor-pointer hover:text-[#f3effc] transition-colors">Home</a>
            <a onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })} className="text-[#f3effc]/70 hover:text-[#f3effc] transition-colors font-label text-sm cursor-pointer">Features</a>
            <a onClick={() => document.getElementById('partners')?.scrollIntoView({ behavior: 'smooth' })} className="text-[#f3effc]/70 hover:text-[#f3effc] transition-colors font-label text-sm cursor-pointer">Partners</a>
            <a onClick={() => document.getElementById('docs')?.scrollIntoView({ behavior: 'smooth' })} className="text-[#f3effc]/70 hover:text-[#f3effc] transition-colors font-label text-sm cursor-pointer">Docs</a>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/login')}
              className="text-[#f3effc]/70 hover:text-[#f3effc] transition-colors font-label text-sm font-medium"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate('/login')}
              className="bg-gradient-to-br from-primary to-primary-container text-on-primary-fixed px-5 py-2 rounded-md font-label text-sm font-bold active:scale-95 transition-all bloom-shadow"
            >
              Start Coding
            </button>
          </div>
        </div>
      </nav>

      <main className="pt-16">
        {/* Hero Section */}
        <section className="relative min-h-[921px] flex flex-col items-center justify-center px-8 overflow-hidden">
          <div className="absolute inset-0 z-0">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[120px]"></div>
          </div>

          <div className="relative z-10 max-w-4xl text-center mt-20">
            <h1 className="font-headline text-6xl md:text-8xl font-bold tracking-tighter mb-6 leading-tight">
              Code. <span className="text-primary neon-glow">Collaborate.</span> Conquer.
            </h1>
            <p className="font-body text-xl md:text-2xl text-on-surface-variant mb-10 max-w-2xl mx-auto leading-relaxed">
              The next-generation collaborative terminal designed for high-velocity teams and competitive programmers.
            </p>
            <div className="flex flex-col md:flex-row gap-6 justify-center">
              <button
                onClick={() => navigate('/login')}
                className="bg-gradient-to-br from-primary to-primary-container text-on-primary-fixed px-10 py-4 rounded-md font-headline text-lg font-bold active:scale-95 transition-all shadow-[0_0_30px_rgba(183,159,255,0.3)]"
              >
                Start Coding Now
              </button>
              <button className="bg-surface-container-highest text-on-surface px-10 py-4 rounded-md font-headline text-lg font-bold border border-outline-variant/20 hover:bg-surface-bright transition-all">
                View Demo
              </button>
            </div>
          </div>

          {/* Dashboard Preview / Code Editor Mockup (Preserved animated version) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, rotateX: 20, rotateY: -15, rotateZ: 5 }}
            animate={{ opacity: 1, scale: 1, rotateX: 10, rotateY: -20, rotateZ: 3 }}
            transition={{ duration: 1.2, delay: 0.3, type: "spring", stiffness: 50 }}
            className="relative z-10 mt-20 w-full max-w-[800px] mx-auto perspective-[2000px] hidden md:block mb-20"
          >
            <div className="bg-elevated/80 backdrop-blur-md border border-border/50 rounded-2xl shadow-[0_30px_60px_rgba(0,0,0,0.6),0_0_40px_rgba(114,79,152,0.3)] overflow-hidden flex flex-col h-[400px] relative transform-style-3d text-left">
              {/* Window Header */}
              <div className="h-10 border-b border-border/50 bg-surface/80 flex items-center px-4 gap-2 shrink-0">
                <div className="w-3 h-3 rounded-full bg-danger/80" />
                <div className="w-3 h-3 rounded-full bg-accent/80" />
                <div className="w-3 h-3 rounded-full bg-success/80" />
                <div className="ml-4 text-xs font-mono text-muted">binary_search.cpp</div>
              </div>

              {/* Code Content */}
              <div className="p-6 font-mono text-sm leading-relaxed overflow-hidden relative h-full">
                <pre>
                  <span className="text-primary-hover">#include</span> <span className="text-success">&lt;iostream&gt;</span><br />
                  <span className="text-primary-hover">#include</span> <span className="text-success">&lt;vector&gt;</span><br />

                  <span className="text-accent">int</span> binarySearch(<span className="text-primary">const</span> std::vector&lt;<span className="text-accent">int</span>&gt;&amp; arr, <span className="text-accent">int</span> target) {'{'}<br />
                  <span className="text-muted/60">// Two pointers initialization</span><br />
                  <span className="text-accent">int</span> left = <span className="text-accent-hover">0</span>;<br />
                  <span className="text-accent">int</span> right = arr.size() - <span className="text-accent-hover">1</span>;<br />

                  <span className="text-primary">while</span> (left &lt;= right) {'{'}<br />
                  <span className="text-accent">int</span> mid = left + (right - left) / <span className="text-accent-hover">2</span>;<br />

                  <span className="text-primary">if</span> (arr[mid] == target)<br />
                  <span className="text-primary">return</span> mid;<br />
                  <span className="text-primary">if</span> (arr[mid] &lt; target)<br />
                  left = mid + <span className="text-accent-hover">1</span>;<br />
                  <span className="text-primary">else</span><br />
                  right = mid - <span className="text-accent-hover">1</span>;<br />
                  {'}'}<br />
                  <span className="text-primary">return</span> <span className="text-danger">-1</span>;<br />
                  {'}'}<br />
                </pre>

                {/* Animated Cursors */}
                <motion.div
                  animate={{
                    x: [100, 160, 220, 160],
                    y: [120, 150, 150, 120]
                  }}
                  transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                  className="absolute top-0 left-0 flex flex-col items-center pointer-events-none"
                >
                  <motion.div className="w-0.5 h-4 bg-danger" />
                  <div className="mt-1 px-2 py-0.5 rounded-full bg-danger text-[9px] font-bold text-white shadow-lg whitespace-nowrap">
                    Alice
                  </div>
                </motion.div>

                <motion.div
                  animate={{
                    x: [300, 320, 320, 280],
                    y: [220, 220, 260, 260]
                  }}
                  transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut", delay: 1 }}
                  className="absolute top-0 left-0 flex flex-col items-center pointer-events-none"
                >
                  <motion.div className="w-0.5 h-4 bg-[#8b75a6]" />
                  <div className="mt-1 px-2 py-0.5 rounded-full bg-[#8b75a6] text-[9px] font-bold text-white shadow-lg whitespace-nowrap">
                    Bob
                  </div>
                </motion.div>

              </div>
            </div>
          </motion.div>
        </section>

        {/* Trusted By Section */}
        <section id="partners" className="py-20 bg-surface-container-low">
          <div className="max-w-screen-2xl mx-auto px-8 text-center">
            <p className="font-label text-sm uppercase tracking-[0.2em] text-on-surface-variant mb-10">Trusted by the industry's most innovative teams</p>
            <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-40 grayscale contrast-125">
              <img alt="AWS" className="h-8" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBmuOLB6Wf5ivw-9nf_erDjcZgQG0G1a3ykstB5iCE0xQgxWbsvZllcRExwOrDSSElULaUasdKikt5vvUrPB2n1FbXW9O3sVeJKnbLXvyBLr-NBOlxYogjG9-MeEaB48AGFRGI_YUk3tz5TeGXZ_h0eEiAO9WFlN-wx7P1N7MjJXgvBdGc7426Z4jYse4p2EywxojJ7-OzNFVI7e3K9Af-dBD7aLEP-z_-sBKdnWVSUtujXSffvU-YgdvP7IGhvnQ0APdg7Tb143oda" />
              <img alt="Stripe" className="h-8" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBhA9k6Bd8OX3RE8M09JxBjlaSZhenH-85yuYIHOaiM3rdTIYtIARXkpxYKQt2Pltob0F8w18yxvRxaomI-DKdXpRwCZtjE68-ki9slR_nEw9m8lbr61rKREYe32kb90cpoZQzikTAuS4TDUSEwOLuNo5O-2kEpPUlqr2ErY7V4ON4iZqjqNs_MFnOqvuzKF76cUcvM3TZjWkuZpFf4J8MRXBeQgcWeRkkpsvmEAQONYZO0kcAzGoV54PveC-soEAOKs6LKWl8DZ8Su" />
              <img alt="Netflix" className="h-8" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA_rhbG7TAhvb_qT_8WmIDUb9nXvBDulSi0CoX8i0Ft9txfsuRJG_VFBOoZoHnSglQCOCGP8BA26daVz-CQJbF69KEGKEeDrOqh1HzBvfdOhfVJ2i-4WlhnptpQs1-MCMSnGBN_su3zYQXVNJcOfIp-fz6H4UTVRSPEPvHznJoWtPOUtHHp18RyFdpUs18QHows04zEuq8x8VXYqCUAVUGX7HhkClrAnhvAiPUJV78REmOCoHwXfobClQNhrwEM1JZkFia6HCuvNilF" />
              <img alt="Google" className="h-8" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBW_GirSixpwfSBUx3iVh0rDBiaUlo_BAbyCBBgBe58JSoBZ5tznr419eZNStIlzjL1drkKHxaOM80cm6mNmdq4ek-7_auOSjvigQJANUqBOR3XnZc3UF-OfUwjMTZUt_X45zC-mKn4z_dSOcNhYc7DESWClbm1-GKnoyD3mXm5SAeGzYoFQg4SJNzmLRNnf0BgTFccewHdW8alueo69zO3dPp0a5WigtIctFVoQoERgRdhHXkhO9y47Hn_t5pa6Yry63Oum-ynr0Jw" />
            </div>
          </div>
        </section>

        {/* Feature Bento Grid */}
        <section id="features" className="py-32 px-8 max-w-screen-2xl mx-auto">
          <div className="mb-20">
            <h2 className="font-headline text-4xl md:text-5xl font-bold mb-4">Precision Engineering.</h2>
            <p className="text-on-surface-variant max-w-xl text-lg">Every feature is optimized for the flow state, ensuring your environment keeps pace with your logic.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Main Feature */}
            <div className="md:col-span-8 bg-surface-container-low rounded-xl p-10 flex flex-col justify-between min-h-[400px] border border-outline-variant/20 hover:border-primary/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-glow group cursor-pointer">
              <div>
                <span className="material-symbols-outlined text-primary text-4xl mb-6">groups</span>
                <h3 className="font-headline text-3xl font-bold mb-4">Real-time Collaboration</h3>
                <p className="text-on-surface-variant text-lg leading-relaxed max-w-md">Live multi-cursor editing with zero latency. Seamlessly pair program, conduct live reviews, or mentor teammates across the globe in a shared terminal environment.</p>
              </div>
              <div className="mt-10 flex gap-4">
                <span className="bg-primary/10 text-primary-fixed-dim px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">Live Sync</span>
                <span className="bg-primary/10 text-primary-fixed-dim px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">Multi-Cursor</span>
              </div>
            </div>
            {/* Secondary Feature 1 */}
            <div className="md:col-span-4 bg-surface-container-highest rounded-xl p-10 border border-outline-variant/20 hover:border-tertiary/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(255,242,171,0.2)] group cursor-pointer">
              <span className="material-symbols-outlined text-tertiary text-4xl mb-6">psychology</span>
              <h3 className="font-headline text-2xl font-bold mb-4">AI Code Review</h3>
              <p className="text-on-surface-variant leading-relaxed">Instant semantic feedback and automated bug detection. Our neural engine suggests optimizations while you type.</p>
            </div>
            {/* Secondary Feature 2 */}
            <div className="md:col-span-4 bg-surface-container-highest rounded-xl p-10 border border-outline-variant/20 hover:border-error/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(255,110,132,0.2)] group cursor-pointer">
              <span className="material-symbols-outlined text-error text-4xl mb-6">insights</span>
              <h3 className="font-headline text-2xl font-bold mb-4">Performance Analytics</h3>
              <p className="text-on-surface-variant leading-relaxed">Track execution speed, memory usage, and latency metrics in real-time with granular dashboard insights.</p>
            </div>
            {/* Secondary Feature 3 (Competitive Programming Focus) */}
            <div className="md:col-span-8 bg-surface-container-low rounded-xl p-10 flex items-center gap-10 border border-outline-variant/20 hover:border-primary/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-glow group cursor-pointer">
              <div className="hidden lg:block w-1/3">
                <img className="w-full h-40 object-cover rounded-lg" alt="abstract 3d visualization" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDctwkVHTdA49u0mqBzJ-WkEfYksoAnUQMePwlX530-n7uBdR_KqLKnMbUwfwycFWdRDnAgaMHX_PpG7m9MUXhF3qP48s3KCH55uGxgOeVtXIqbOV9O0Nxb7NwpPCwGH0p6qc3O7CcCC34sJhLjIOfGAegCe91vN2ydKqmx8ZKRccHgTBf57IrAdO_nS49JRa3rJCXYOo5OQZDcp1ZYq_wjHe9nHg5oLbFyD4moTZQurwX3ux-dzECPjdBJ1413hOz0QeHS1NP-Gria" />
              </div>
              <div className="flex-1">
                <h3 className="font-headline text-2xl font-bold mb-4">Engineered for Competitive Programmers</h3>
                <p className="text-on-surface-variant leading-relaxed mb-6">Integrated judge systems, automated test case generation, and a high-performance compiler suite. Conquer any challenge with tools built for speed and precision.</p>
                <a className="text-primary font-bold flex items-center gap-2 hover:translate-x-1 transition-transform cursor-pointer">
                  Learn more about Contest Mode
                  <span className="material-symbols-outlined">arrow_forward</span>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Value Prop Section */}
        <section id="docs" className="py-32 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-tertiary/5 rounded-full blur-[100px] -mr-80"></div>
          <div className="max-w-4xl mx-auto text-center px-8 relative z-10">
            <h2 className="font-headline text-4xl md:text-6xl font-bold mb-10 tracking-tight">
              The IDE That <span className="text-primary italic">Evolves</span> With Your Every Stroke
            </h2>
            <div className="grid md:grid-cols-3 gap-12 text-left">
              <div>
                <h4 className="text-tertiary font-headline font-bold mb-3">0ms Latency</h4>
                <p className="text-on-surface-variant text-sm leading-relaxed">Our proprietary sync engine ensures changes are reflected instantly, even on low-bandwidth connections.</p>
              </div>
              <div>
                <h4 className="text-tertiary font-headline font-bold mb-3">Enterprise Grade</h4>
                <p className="text-on-surface-variant text-sm leading-relaxed">SSO integration, audit logs, and SOC2 compliance out of the box for secure team collaboration.</p>
              </div>
              <div>
                <h4 className="text-tertiary font-headline font-bold mb-3">Extension Ready</h4>
                <p className="text-on-surface-variant text-sm leading-relaxed">Full compatibility with the VS Code extension ecosystem. Bring your favorite themes and tools.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-32 px-8">
          <div className="max-w-5xl mx-auto glass-panel p-16 rounded-2xl text-center border border-outline-variant/10 relative">
            <div className="relative z-10">
              <h2 className="font-headline text-4xl md:text-5xl font-bold mb-6">Ready to upgrade your skills?</h2>
              <p className="text-on-surface-variant text-lg mb-10 max-w-xl mx-auto">Join over 50,000 developers building the future on CodeEra. <br />Start today.</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => navigate('/login')}
                  className="bg-gradient-to-br from-primary to-primary-container text-on-primary-fixed px-8 py-4 rounded-md font-headline font-bold text-lg bloom-shadow transition-transform cursor-pointer"
                >
                  Get Started&nbsp;
                </button>
                <button
                  onClick={() => navigate('/login')}
                  className="bg-transparent border border-outline-variant text-on-surface px-8 py-4 rounded-md font-headline font-bold text-lg hover:bg-surface-bright transition-all transition-transform cursor-pointer">
                  View a Demo
                </button>
              </div>
              <p className="mt-6 text-xs text-on-surface-variant/60 font-label">No credit card required. Cancel anytime.</p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#0e0d16] w-full py-12 border-t border-[#484751]/15">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 px-8 max-w-screen-2xl mx-auto">
          <div className="col-span-2 md:col-span-1">
            <div className="text-lg font-bold text-[#f3effc] font-headline mb-4">CodeEra</div>
            <p className="text-[#f3effc]/50 font-body text-sm leading-relaxed max-w-xs">
              Building the world's most responsive collaborative terminal for the next generation of engineers.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <h5 className="text-[#f3effc] font-bold text-sm mb-2">Product</h5>
            <a className="text-[#f3effc]/50 hover:text-[#fff2ab] transition-colors font-body text-sm cursor-pointer">Documentation</a>
            <a className="text-[#f3effc]/50 hover:text-[#fff2ab] transition-colors font-body text-sm cursor-pointer">Changelog</a>
            <a className="text-[#f3effc]/50 hover:text-[#fff2ab] transition-colors font-body text-sm cursor-pointer">Status</a>
          </div>
          <div className="flex flex-col gap-3">
            <h5 className="text-[#f3effc] font-bold text-sm mb-2">Company</h5>
            <a className="text-[#f3effc]/50 hover:text-[#fff2ab] transition-colors font-body text-sm cursor-pointer">Community</a>
            <a className="text-[#f3effc]/50 hover:text-[#fff2ab] transition-colors font-body text-sm cursor-pointer">Privacy</a>
            <a className="text-[#f3effc]/50 hover:text-[#fff2ab] transition-colors font-body text-sm cursor-pointer">Terms</a>
          </div>
          <div className="flex flex-col gap-3">
            <h5 className="text-[#f3effc] font-bold text-sm mb-2">Connect</h5>
            <a className="text-[#f3effc]/50 hover:text-[#fff2ab] transition-colors font-body text-sm cursor-pointer">Twitter / X</a>
            <a className="text-[#f3effc]/50 hover:text-[#fff2ab] transition-colors font-body text-sm cursor-pointer">GitHub</a>
            <a className="text-[#f3effc]/50 hover:text-[#fff2ab] transition-colors font-body text-sm cursor-pointer">Discord</a>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-outline-variant/10 text-center text-[#f3effc]/30 font-body text-xs">
          © 2024 CodeEra. The Kinetic Terminal.
        </div>
      </footer>
    </div>
  );
}
