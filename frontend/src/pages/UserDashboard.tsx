import { useEffect, useState } from 'react';
import useAuthStore from '../store/authStore';
import api from '../lib/axios';
import { Calendar, Loader2, User } from 'lucide-react';
import { Link } from 'react-router-dom';

interface BookingRecord {
  id: number;
  session_details: {
    title: string;
    date: string;
    image: string | null;
    creator_details: { first_name: string; username: string };
  };
  is_paid: boolean;
  created_at: string;
  session: number;
}

export default function UserDashboard() {
  const { user } = useAuthStore();
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    api.get('/bookings/bookings/')
      .then(res => setBookings(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 animate-fade-in-up">
        <div>
          <h1 className="text-5xl font-black tracking-tight mb-2">Welcome, <span className="text-primary">{user?.first_name || user?.username}</span></h1>
          <p className="text-foreground/50 text-lg">Manage your learning journey and upcoming sessions.</p>
        </div>
      </div>
      
      <div className="glass-card p-8 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
        <h2 className="text-2xl font-bold mb-8 flex items-center gap-3 border-b border-white/5 pb-6">
          <Calendar className="text-primary w-6 h-6" /> My Booked Sessions
        </h2>
        
        {bookings.length === 0 ? (
          <div className="bg-background/50 border border-white/5 border-dashed rounded-[2rem] p-16 text-center">
             <Calendar className="w-12 h-12 text-primary/20 mx-auto mb-4" />
             <h3 className="text-xl font-bold mb-2">No sessions booked yet</h3>
             <p className="text-gray-400 max-w-xs mx-auto mb-8">Start exploring the catalog to find sessions that match your interests!</p>
             <a href="/" className="inline-flex bg-primary/20 hover:bg-primary/30 text-primary font-bold px-8 py-3 rounded-full transition-all">Explore Catalog</a>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bookings.map((booking, i) => (
              <div key={booking.id} className="bg-background/80 border border-white/10 rounded-2xl overflow-hidden hover:border-primary/30 transition-all hover:scale-[1.02] animate-fade-in-up group" style={{ animationDelay: `${i * 100}ms` }}>
                {booking.session_details.image && (
                   <div className="h-40 w-full overflow-hidden">
                      <img src={booking.session_details.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                   </div>
                )}
                <div className="p-6">
                  <h3 className="font-bold text-xl mb-2 truncate group-hover:text-primary transition-colors">{booking.session_details.title}</h3>
                  <div className="space-y-2 mb-6">
                    <p className="text-sm text-gray-400 flex items-center gap-2"><Calendar className="w-4 h-4 text-primary" /> {new Date(booking.session_details.date).toLocaleString()}</p>
                    <p className="text-sm text-gray-400 flex items-center gap-2"><User className="w-4 h-4 text-accent" /> By {booking.session_details.creator_details.first_name}</p>
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t border-white/5">
                     <span className={`text-[10px] font-black tracking-widest px-3 py-1 rounded-full border ${booking.is_paid ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'}`}>
                       {booking.is_paid ? 'PAID' : 'PENDING'}
                     </span>
                     <Link to={`/sessions/${booking.session}`} className="text-primary text-sm font-bold hover:underline">View Details</Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
