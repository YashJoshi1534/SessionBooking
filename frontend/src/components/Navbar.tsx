import { Link } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import useAuthStore from '../store/authStore';
import { LogOut, User as UserIcon, LayoutDashboard, Compass, PlusCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function Navbar() {
  const { user, isAuthenticated, loginWithGoogle, logout } = useAuthStore();

  const handleLogin = useGoogleLogin({
    onSuccess: (tokenResponse) => loginWithGoogle(tokenResponse.access_token),
  });

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
  };

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-5xl px-6 pointer-events-none">
      <nav className="glass px-6 py-4 flex items-center justify-between rounded-full border border-white/10 shadow-2xl pointer-events-auto">
        <Link to="/" className="flex items-center gap-2 group transition-transform hover:scale-105 active:scale-95">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center p-1 shadow-lg shadow-primary/20">
            <Compass className="w-full h-full text-white animate-pulse-slow" />
          </div>
          <span className="text-xl font-bold text-gradient tracking-tight">
            Sessions
          </span>
        </Link>
        
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4 text-sm font-medium">
            <Link to="/" className="text-foreground/70 hover:text-primary transition-colors">Explorer</Link>
            {isAuthenticated && (
              <Link to="/dashboard" className="flex items-center gap-1.5 text-foreground/70 hover:text-primary transition-colors">
                {user?.role === 'CREATOR' ? (
                  <>
                    <PlusCircle className="w-4 h-4 text-primary" />
                    <span className="text-primary font-bold">Create Session</span>
                  </>
                ) : (
                  <>
                    <LayoutDashboard className="w-4 h-4" />
                    <span>Dashboard</span>
                  </>
                )}
              </Link>
            )}
          </div>

          <div className="h-4 w-px bg-white/10" />

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <Link to="/profile" className="flex items-center gap-2 bg-white/5 pl-1.5 pr-3 py-1 rounded-full border border-white/5 group hover:bg-white/10 transition-colors">
                  <div className="w-7 h-7 rounded-full overflow-hidden border border-white/10 ring-2 ring-transparent group-hover:ring-primary/30 transition-all">
                    {user?.avatar_url ? (
                      <img src={user.avatar_url} alt="Avatar" className="w-full h-full object-cover" crossOrigin="anonymous" />
                    ) : (
                      <div className="w-full h-full bg-secondary flex items-center justify-center">
                        <UserIcon className="w-4 h-4 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <span className="text-sm font-semibold max-w-[80px] truncate">{user?.first_name || user?.username}</span>
                </Link>
                <button onClick={handleLogout} className="p-2 hover:bg-destructive/10 text-destructive/70 hover:text-destructive rounded-full transition-all group active:scale-90">
                  <LogOut className="w-5 h-5 group-hover:-translate-x-0.5" />
                </button>
              </>
            ) : (
              <button 
                onClick={() => handleLogin()} 
                className="relative group bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2 rounded-full font-bold transition-all shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_30px_rgba(139,92,246,0.5)] active:scale-95 overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500 skew-x-[-20deg]" />
                <span className="relative">Start Session</span>
              </button>
            )}
          </div>
        </div>
      </nav>
    </div>
  );
}
