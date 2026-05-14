import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeProvider';
import { 
  Bot, 
  Shield, 
  Zap, 
  CheckCircle2, 
  ArrowRight,
  MessageCircle,
  Cpu,
  Globe,
  Lock,
  Sun,
  Moon
} from 'lucide-react';

const Home: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-500 overflow-x-hidden">
      {/* Decorative Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[120px] rounded-full" />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-background/60 backdrop-blur-xl z-50 border-b border-border">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-500/20">
                <Bot size={24} className="text-white" />
              </div>
              <span className="font-black text-2xl tracking-tighter">Tele-Gateway</span>
            </div>
            
            <div className="hidden md:flex items-center gap-10">
              <a href="#features" className="text-sm font-bold text-muted-foreground hover:text-indigo-500 transition-colors uppercase tracking-widest">Features</a>
              <a href="#pricing" className="text-sm font-bold text-muted-foreground hover:text-indigo-500 transition-colors uppercase tracking-widest">Pricing</a>
              <div className="h-6 w-px bg-border" />
              <button 
                onClick={toggleTheme}
                className="p-2 rounded-xl hover:bg-muted transition-colors text-muted-foreground"
              >
                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              <Link to="/login" className="text-sm font-black uppercase tracking-widest hover:text-indigo-500 transition-colors">Portal Access</Link>
              <Link to="/dashboard" className="bg-indigo-600 text-white px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-[0.2em] hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-600/20 active:scale-95">
                Initialize Node
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="relative z-10">
        {/* Hero Section */}
        <section className="pt-48 pb-32 px-6">
          <div className="max-w-7xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 text-[10px] font-black uppercase tracking-[0.3em] mb-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
              </span>
              Next-Gen Automation Protocol Active
            </div>
            
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-8 leading-[0.9] animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
              Automate and Scale Your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-blue-500">Communities.</span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-12 leading-relaxed font-medium animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-300">
              The ultimate infrastructure for managing Telegram groups, userbots, and advanced automation. 
              Engineered for high-volume operations and secure community orchestration.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 animate-in fade-in slide-in-from-bottom-16 duration-1000 delay-500">
              <Link to="/dashboard" className="w-full sm:w-auto bg-indigo-600 text-white px-10 py-5 rounded-[2rem] text-sm font-black uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-2xl shadow-indigo-600/30 flex items-center justify-center gap-3 active:scale-95 group">
                Begin Deployment <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <button className="w-full sm:w-auto bg-card border border-border px-10 py-5 rounded-[2rem] text-sm font-black uppercase tracking-widest hover:bg-muted transition-all flex items-center justify-center gap-3 shadow-xl">
                View Architecture
              </button>
            </div>
            
            {/* Dashboard Preview */}
            <div className="mt-32 relative max-w-5xl mx-auto animate-in fade-in zoom-in duration-1000 delay-700">
              <div className="absolute inset-0 bg-indigo-500/20 blur-[120px] rounded-full opacity-50" />
              <div className="relative bg-slate-900 rounded-[3rem] p-3 shadow-[0_0_100px_rgba(99,102,241,0.15)] border border-white/5 overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />
                <img 
                  src="https://images.unsplash.com/photo-1614064641938-3bbee52942c7?auto=format&fit=crop&q=80&w=2000" 
                  alt="Terminal Console" 
                  className="rounded-[2.5rem] opacity-80 grayscale-[0.2]"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-32 px-6 bg-muted/30">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-24">
              <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight">Core Infrastructure</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto font-medium">Enterprise-grade tools for modern Telegram automation.</p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  icon: <Cpu size={24} />,
                  title: "Smart Group Logic",
                  desc: "Advanced member management and community orchestration algorithms."
                },
                {
                  icon: <Shield size={24} />,
                  title: "Quantum Security",
                  desc: "AI-powered moderation and automated threat neutralization."
                },
                {
                  icon: <Zap size={24} />,
                  title: "Instant Analytics",
                  desc: "Zero-latency insights into growth and engagement metrics."
                },
                {
                  icon: <Lock size={24} />,
                  title: "Zero-Knowledge",
                  desc: "Secure account linking with end-to-end encrypted protocols."
                }
              ].map((feature, i) => (
                <div key={i} className="bg-card glass p-10 rounded-[2.5rem] border border-border group hover:border-indigo-500/30 transition-all">
                  <div className="bg-indigo-500/10 w-14 h-14 rounded-2xl flex items-center justify-center mb-8 text-indigo-500 ring-1 ring-indigo-500/20 group-hover:scale-110 transition-transform">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-black mb-4 tracking-tight">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed text-sm font-medium">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-24 px-6 border-y border-border">
          <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-12">
            {[
              { label: 'Active Nodes', value: '1,284' },
              { label: 'Rules Processed', value: '42.8M' },
              { label: 'Uptime', value: '99.99%' },
              { label: 'API Latency', value: '< 15ms' },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <p className="text-4xl md:text-5xl font-black tracking-tighter mb-2">{stat.value}</p>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-32 px-6">
          <div className="max-w-7xl mx-auto text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight">Flexible Quotas</h2>
            <p className="text-muted-foreground font-medium">Select the protocol that fits your scaling needs.</p>
          </div>
          
          <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-10">
            {[
              { name: "Standard", price: "0", features: ["1 Active Node", "10 Rules", "Basic Moderation"] },
              { name: "Professional", price: "29", features: ["Unlimited Nodes", "AI Automation", "Full Analytics", "Direct Support"], popular: true },
              { name: "Enterprise", price: "Custom", features: ["Dedicated Hardware", "SLA Guarantee", "Custom Logic", "24/7 Priority"] }
            ].map((plan, i) => (
              <div key={i} className={`relative p-10 rounded-[3rem] border ${plan.popular ? 'border-indigo-600 bg-indigo-600 text-white shadow-2xl shadow-indigo-600/30' : 'border-border bg-card'} flex flex-col group transition-all hover:scale-[1.02]`}>
                {plan.popular && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white text-indigo-600 text-[10px] font-black uppercase tracking-[0.2em] px-6 py-2 rounded-full shadow-lg">
                    Recommended
                  </div>
                )}
                <h3 className={`text-xl font-black mb-6 uppercase tracking-widest ${plan.popular ? 'text-white/80' : 'text-muted-foreground'}`}>{plan.name}</h3>
                <div className="mb-10">
                  <span className="text-5xl font-black tracking-tighter">${plan.price}</span>
                  {plan.price !== "Custom" && <span className={`text-sm ml-2 ${plan.popular ? 'text-white/60' : 'text-muted-foreground'}`}>/cycle</span>}
                </div>
                
                <ul className="space-y-5 mb-12 flex-1">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-center gap-3 text-sm font-bold">
                      <CheckCircle2 size={18} className={plan.popular ? 'text-white/60' : 'text-indigo-500'} />
                      {feature}
                    </li>
                  ))}
                </ul>
                
                <button className={`w-full py-5 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-xl ${plan.popular ? 'bg-white text-indigo-600 hover:bg-indigo-50 shadow-white/10' : 'bg-muted text-foreground hover:bg-border'}`}>
                  {plan.price === "Custom" ? "Contact Core" : "Initialize"}
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-32 px-6">
          <div className="max-w-5xl mx-auto bg-indigo-600 rounded-[4rem] p-16 md:p-24 text-center text-white relative overflow-hidden shadow-[0_0_120px_rgba(99,102,241,0.4)]">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-[100px]" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-400/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-[100px]" />
            
            <h2 className="text-4xl md:text-6xl font-black mb-8 relative z-10 tracking-tight">Ready for Deployment?</h2>
            <p className="text-indigo-100 text-lg mb-12 max-w-2xl mx-auto relative z-10 font-medium">Join the network of elite community managers orchestrating at scale.</p>
            
            <Link to="/dashboard" className="inline-flex items-center gap-3 bg-white text-indigo-600 px-12 py-5 rounded-[2rem] text-sm font-black uppercase tracking-widest hover:bg-indigo-50 transition-all relative z-10 shadow-2xl active:scale-95 group">
              Start Configuration <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-20 border-t border-border bg-muted/20">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-12">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-600 p-1.5 rounded-lg">
                <Bot size={20} className="text-white" />
              </div>
              <span className="font-black text-xl tracking-tighter">Tele-Gateway</span>
            </div>
            
            <div className="flex items-center gap-10">
              <a href="#" className="text-muted-foreground hover:text-indigo-500 transition-colors"><MessageCircle size={20} /></a>
              <a href="#" className="text-muted-foreground hover:text-indigo-500 transition-colors"><Globe size={20} /></a>
              <a href="#" className="text-muted-foreground hover:text-indigo-500 transition-colors font-bold text-xs uppercase tracking-widest">Protocol Docs</a>
            </div>
            
            <p className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em]">© 2026 Tele-Gateway. Secure Node Access.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
