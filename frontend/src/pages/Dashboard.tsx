import useAuthStore from '../store/authStore';
import UserDashboard from './UserDashboard';
import CreatorDashboard from './CreatorDashboard';
import { Navigate } from 'react-router-dom';

export default function Dashboard() {
  const { user, isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (user?.role === 'CREATOR') {
    return <CreatorDashboard />;
  }

  return <UserDashboard />;
}
