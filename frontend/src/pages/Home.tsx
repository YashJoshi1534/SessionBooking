import { useEffect, useState } from 'react';
import api from '../lib/axios';
import { Link } from 'react-router-dom';
import { Calendar, User, Clock, ArrowRight, Sparkles, TrendingUp, ShieldCheck, Compass } from 'lucide-react';

export interface Session {
  id: number;
  title: string;
  description: string;
  price: string;
  image: string | null;
  image_url: string | null;
  date: string;
  duration_minutes: number;
  available_spots: number;
  creator_details: {
    first_name: string;
    username: string;
  };
}

export default function Home() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/catalog/sessions/')
      .then(res => setSessions(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const scrollToSessions = () => {
    document.getElementById('sessions-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToFeatures = () => {
    document.getElementById('features-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          <Sparkles className="absolute inset-0 m-auto w-6 h-6 text-primary animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-20">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 mb-24 text-center relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-primary/5 blur-[120px] rounded-full -z-10" />
        
        <div className="animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border-white/5 text-sm font-semibold text-primary mb-8 shadow-xl">
            <Sparkles className="w-4 h-4 fill-primary" />
            <span>Redefining Live Interaction</span>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-black mb-8 tracking-tight leading-[1.1]">
            Unlock Next-Level <br />
            <span className="text-gradient">Experiences</span>
          </h1>
          
          <p className="text-xl text-foreground/60 max-w-2xl mx-auto mb-12 leading-relaxed">
            Join exclusive sessions crafted by world-class creators. 
            From expert coding workshops to spiritual growth—all in one premium platform.
          </p>
          
          <div className="flex items-center justify-center gap-4">
            <button 
              onClick={scrollToSessions}
              className="bg-primary text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-2 hover:bg-primary/90 transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-primary/20 group cursor-pointer"
            >
              Explore All Sessions
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button 
              onClick={scrollToFeatures}
              className="glass px-8 py-4 rounded-2xl font-bold hover:bg-white/10 transition-all hover:scale-105 active:scale-95 border-white/5 cursor-pointer"
            >
              How it works
            </button>
          </div>
        </div>

        {/* Feature badges */}
        <div id="features-section" className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24 max-w-5xl mx-auto animate-fade-in-up" style={{ animationDelay: '300ms' }}>
          {[
            { icon: ShieldCheck, title: "Verified Creators", desc: "Hand-picked experts only" },
            { icon: TrendingUp, title: "Industry Standard", desc: "Learn from the best" },
            { icon: Clock, title: "Flexible Schedule", desc: "Sessions that fit your life" }
          ].map((f, i) => (
            <div key={i} className="glass p-6 rounded-3xl border-white/5 flex flex-col items-center text-center group hover:border-primary/20 transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <f.icon className="w-6 h-6 text-primary" />
              </div>
              <h4 className="font-bold text-lg mb-1">{f.title}</h4>
              <p className="text-foreground/50 text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Sessions Grid */}
      <section id="sessions-section" className="max-w-7xl mx-auto px-6">
        <div className="flex items-end justify-between mb-12">
          <div className="animate-fade-in-up" style={{ animationDelay: '400ms' }}>
            <h2 className="text-4xl font-bold mb-3">Live & Upcoming</h2>
            <p className="text-foreground/50">Don't miss out on these exclusive opportunities</p>
          </div>
          <button className="text-primary font-bold hover:opacity-80 transition-opacity">View All</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sessions.map((session, i) => (
            <Link to={`/sessions/${session.id}`} key={session.id} 
                  className="glass-card group overflow-hidden animate-fade-in-up hover:border-primary/30"
                  style={{ animationDelay: `${500 + (i * 100)}ms` }}
                  >
              <div className="relative aspect-video overflow-hidden">
                {session.image_url ? (
                   <img 
                      src={session.image_url} 
                      alt={session.title} 
                      className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-700"
                      loading="lazy"
                   />
                ) : (
                   <div className="w-full h-full bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
                     <Calendar className="w-12 h-12 text-white/10 group-hover:rotate-12 transition-transform duration-500" />
                   </div>
                )}
                <div className="absolute top-4 right-4 glass px-4 py-1.5 rounded-full text-sm font-bold shadow-2xl">
                  <span className="text-primary">₹</span>{session.price}
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-6">
                  <span className="text-white font-bold flex items-center gap-2">View Details <ArrowRight className="w-4 h-4" /></span>
                </div>
              </div>
              
              <div className="p-8">
                <div className="flex items-center gap-2 text-xs font-bold text-accent uppercase tracking-widest mb-3">
                  <Clock className="w-3 h-3" />
                  {session.duration_minutes} minutes
                </div>
                <h3 className="text-2xl font-bold mb-4 line-clamp-1 group-hover:text-primary transition-colors">{session.title}</h3>
                <p className="text-foreground/50 text-sm line-clamp-2 mb-8 leading-relaxed">{session.description}</p>
                
                <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center border border-white/10 overflow-hidden shadow-lg shadow-black/20">
                      <User className="w-5 h-5 text-foreground/40" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold tracking-tight">{session.creator_details?.first_name || 'Expert Creator'}</span>
                      <span className="text-[10px] text-foreground/40 uppercase font-black tracking-widest leading-none">Creator</span>
                    </div>
                  </div>
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map(j => (
                      <div key={j} className="w-6 h-6 rounded-full border-2 border-card bg-secondary" />
                    ))}
                    <div className="w-6 h-6 rounded-full border-2 border-card bg-primary/20 flex items-center justify-center text-[8px] font-bold">
                      +{session.available_spots}
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
          {sessions.length === 0 && (
            <div className="col-span-full py-20 text-center glass rounded-[2.5rem] border-white/5 animate-fade-in-up" style={{ animationDelay: '600ms' }}>
              <Compass className="w-16 h-16 text-primary/20 mx-auto mb-6 animate-float" />
              <h3 className="text-2xl font-bold mb-2">No active sessions</h3>
              <p className="text-foreground/40 max-w-sm mx-auto">We're currently preparing new exclusive content. Please check back shortly!</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
