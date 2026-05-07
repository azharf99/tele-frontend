import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Bot, 
  Shield, 
  Zap, 
  BarChart3, 
  CheckCircle2, 
  ArrowRight,
  ExternalLink,
  MessageCircle
} from 'lucide-react';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="bg-indigo-600 p-1.5 rounded-lg">
                <Bot size={20} className="text-white" />
              </div>
              <span className="font-bold text-xl tracking-tight text-slate-900">Tele-Gateway</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">Features</a>
              <a href="#pricing" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">Pricing</a>
              <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">Login</Link>
              <Link to="/dashboard" className="bg-indigo-600 text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-indigo-700 transition-all shadow-md shadow-indigo-200">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold uppercase tracking-wider mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-600"></span>
            </span>
            New: v2.0 is now live
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight mb-8">
            Automate and Scale Your <br />
            <span className="text-indigo-600">Telegram Communities</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-600 max-w-3xl mx-auto mb-10 leading-relaxed">
            The ultimate tool for managing Telegram groups, userbots, and automation rules. 
            Keep your communities safe, engaging, and growing effortlessly.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/dashboard" className="w-full sm:w-auto bg-indigo-600 text-white px-8 py-4 rounded-2xl text-lg font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 flex items-center justify-center gap-2">
              Get Started for Free <ArrowRight size={20} />
            </Link>
            <button className="w-full sm:w-auto bg-white text-slate-700 border border-slate-200 px-8 py-4 rounded-2xl text-lg font-bold hover:bg-slate-50 transition-all">
              View Demo
            </button>
          </div>
          
          {/* Dashboard Preview */}
          <div className="mt-20 relative">
            <div className="absolute inset-0 bg-indigo-500 blur-[120px] opacity-10 rounded-full"></div>
            <div className="relative bg-slate-900 rounded-3xl p-2 shadow-2xl border border-slate-800">
              <img 
                src="https://images.unsplash.com/photo-1614064641938-3bbee52942c7?auto=format&fit=crop&q=80&w=2000" 
                alt="Dashboard Preview" 
                className="rounded-2xl opacity-90"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Powerful Features for Power Users</h2>
          <p className="text-slate-600 max-w-2xl mx-auto">Everything you need to manage large-scale Telegram operations without breaking a sweat.</p>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            {
              icon: <Bot className="text-indigo-600" size={24} />,
              title: "Smart Group Management",
              desc: "Easily organize and oversee multiple groups from a single dashboard."
            },
            {
              icon: <Shield className="text-indigo-600" size={24} />,
              title: "Automated Moderation",
              desc: "Set up powerful rules to keep your communities safe and engaging."
            },
            {
              icon: <Zap className="text-indigo-600" size={24} />,
              title: "Real-time Analytics",
              desc: "Gain insights into group activity and member growth instantly."
            },
            {
              icon: <BarChart3 className="text-indigo-600" size={24} />,
              title: "Secure & Reliable",
              desc: "Built with security first to protect your data and Telegram accounts."
            }
          ].map((feature, i) => (
            <div key={i} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-indigo-50 w-12 h-12 rounded-2xl flex items-center justify-center mb-6">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
              <p className="text-slate-600 leading-relaxed text-sm">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-4">
        <div className="max-w-7xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Simple, Transparent Pricing</h2>
          <p className="text-slate-600">Choose the plan that's right for your growth.</p>
        </div>
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8">
          {[
            { name: "Free", price: "0", features: ["1 Group", "Basic Rules", "Community Support"] },
            { name: "Pro", price: "29", features: ["Unlimited Groups", "Advanced AI Rules", "Priority Support", "Analytics"], popular: true },
            { name: "Enterprise", price: "Custom", features: ["Custom Solutions", "Dedicated Manager", "SLA Support", "White-label"] }
          ].map((plan, i) => (
            <div key={i} className={`relative p-8 rounded-3xl border ${plan.popular ? 'border-indigo-600 ring-4 ring-indigo-50' : 'border-slate-200'} bg-white flex flex-col`}>
              {plan.popular && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-indigo-600 text-white text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full">
                  Most Popular
                </div>
              )}
              <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
              <div className="mb-6">
                <span className="text-4xl font-extrabold">${plan.price}</span>
                {plan.price !== "Custom" && <span className="text-slate-500">/mo</span>}
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                {plan.features.map((feature, j) => (
                  <li key={j} className="flex items-center gap-3 text-sm text-slate-600">
                    <CheckCircle2 size={18} className="text-indigo-600 shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
              <button className={`w-full py-4 rounded-2xl font-bold transition-all ${plan.popular ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-slate-100 text-slate-900 hover:bg-slate-200'}`}>
                {plan.price === "Custom" ? "Contact Sales" : "Get Started"}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto bg-indigo-600 rounded-[3rem] p-12 md:p-20 text-center text-white relative overflow-hidden shadow-2xl shadow-indigo-300">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-400/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl"></div>
          <h2 className="text-3xl md:text-5xl font-extrabold mb-6 relative z-10">Ready to take control?</h2>
          <p className="text-indigo-100 text-lg mb-10 max-w-2xl mx-auto relative z-10">Join thousands of community managers who are already scaling their groups with Tele-Gateway.</p>
          <Link to="/dashboard" className="inline-flex items-center gap-2 bg-white text-indigo-600 px-10 py-4 rounded-2xl text-lg font-bold hover:bg-indigo-50 transition-all relative z-10">
            Get Started Now <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-2">
              <div className="bg-indigo-600 p-1 rounded-md">
                <Bot size={16} className="text-white" />
              </div>
              <span className="font-bold text-lg text-slate-900">Tele-Gateway</span>
            </div>
            <div className="flex items-center gap-6">
              <a href="#" className="text-slate-400 hover:text-indigo-600 transition-colors"><ExternalLink size={20} /></a>
              <a href="#" className="text-slate-400 hover:text-indigo-600 transition-colors"><ExternalLink size={20} /></a>
              <a href="#" className="text-slate-400 hover:text-indigo-600 transition-colors"><MessageCircle size={20} /></a>
            </div>
            <p className="text-slate-400 text-sm">© 2026 Tele-Gateway. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
