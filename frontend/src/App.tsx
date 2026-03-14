import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import useAuthStore from './store/authStore';
import { GoogleOAuthProvider, useGoogleLogin } from '@react-oauth/google';
import { Toaster } from 'sonner';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import SessionDetail from './pages/SessionDetail';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';

const LoginRedirect = () => {
  const { loginWithGoogle, isAuthenticated } = useAuthStore();
  const login = useGoogleLogin({
    onSuccess: (codeResponse) => loginWithGoogle(codeResponse.access_token),
  });

  useEffect(() => {
    if (!isAuthenticated) {
      login();
    }
  }, [isAuthenticated, login]);

  if (isAuthenticated) return <Navigate to="/" replace />;
  
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      <p className="text-gray-400 font-medium">Redirecting to Google Login...</p>
    </div>
  );
};

function App() {
  const { checkAuth, isLoading } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isLoading) return <div className="flex items-center justify-center min-h-screen bg-background text-white delay-150">Loading...</div>;

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || 'dummy-client-id'}>
      <BrowserRouter>
        <div className="min-h-screen bg-background text-foreground selection:bg-primary/30">
          <Toaster 
            theme="dark" 
            position="bottom-right" 
            toastOptions={{
              style: {
                background: 'rgba(15, 15, 20, 0.8)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#fff',
                borderRadius: '16px',
              },
            }} 
          />
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<LoginRedirect />} />
            <Route path="/sessions/:id" element={<SessionDetail />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </div>
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
}

export default App;
