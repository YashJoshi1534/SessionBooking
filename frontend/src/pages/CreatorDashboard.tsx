import { useEffect, useState } from 'react';
import useAuthStore from '../store/authStore';
import api from '../lib/axios';
import { Loader2, Plus, Users, Calendar, Clock, IndianRupee, Image as ImageIcon, Globe } from 'lucide-react';
import { Session } from './Home';
import DatePicker from 'react-datepicker';
import TimezoneSelect, { ITimezone, ITimezoneOption } from 'react-timezone-select';
import dayjs from 'dayjs';
import { toast } from 'sonner';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

import "react-datepicker/dist/react-datepicker.css";

dayjs.extend(utc);
dayjs.extend(timezone);

interface Booking {
  id: number;
  user_details: { first_name: string; username: string };
  is_paid: boolean;
  created_at: string;
  session: number;
}

export default function CreatorDashboard() {
  const { user } = useAuthStore();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isCreating, setIsCreating] = useState(false);
  const [newSession, setNewSession] = useState({ title: '', description: '', price: '0.00', duration_minutes: 60, available_spots: 10, date: '' });
  const [startDate, setStartDate] = useState<Date | null>(new Date());
  const [selectedTimezone, setSelectedTimezone] = useState<ITimezoneOption>(
    Intl.DateTimeFormat().resolvedOptions().timeZone as any
  );
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    Promise.all([
      api.get('/catalog/sessions/'),
      api.get('/bookings/bookings/')
    ]).then(([sessionsRes, bookingsRes]) => {
      // Filter sessions for this creator since endpoint currently returns all
      setSessions(sessionsRes.data.filter((s: Session) => s.creator_details?.username === user?.username));
      setBookings(bookingsRes.data);
    }).catch(console.error).finally(() => setLoading(false));
  }, [user]);

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate) return;
    
    setIsCreating(true);
    const formData = new FormData();
    
    // Format date with timezone using dayjs
    const formattedDate = dayjs(startDate)
      .tz(typeof selectedTimezone === 'string' ? selectedTimezone : selectedTimezone.value)
      .format();

    Object.entries(newSession).forEach(([key, value]) => {
      if (key !== 'date') formData.append(key, String(value));
    });
    formData.append('date', formattedDate);
    
    if (imageFile) formData.append('image', imageFile);

    try {
      const res = await api.post('/catalog/sessions/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Session created successfully!');
      setSessions([res.data, ...sessions]);
      setNewSession({ title: '', description: '', price: '0.00', duration_minutes: 60, available_spots: 10, date: '' });
      setStartDate(new Date());
      setImageFile(null);
    } catch (e) {
      console.error(e);
      toast.error('Failed to create session');
    } finally {
      setIsCreating(false);
    }
  };

  if (loading) return <div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <h1 className="text-4xl font-extrabold mb-8 animate-fade-in-up tracking-tight">Creator <span className="text-primary">Studio</span></h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Create Session Form */}
        <div className="lg:col-span-1 glass-card p-6 h-fit animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2 border-b border-white/5 pb-4">
            <Plus className="text-accent" /> Create New Session
          </h2>
          <form onSubmit={handleCreateSession} className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm text-gray-400 font-medium">Session Title</label>
              <input required type="text" value={newSession.title} onChange={e => setNewSession({...newSession, title: e.target.value})} 
                     className="w-full bg-background border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-primary transition-colors" />
            </div>
            <div className="space-y-1">
              <label className="text-sm text-gray-400 font-medium">Description</label>
              <textarea required value={newSession.description} onChange={e => setNewSession({...newSession, description: e.target.value})} rows={3}
                     className="w-full bg-background border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-primary transition-colors resize-none" />
            </div>
            
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-sm text-gray-400 font-medium flex items-center gap-2"><Calendar className="w-4 h-4 text-primary" /> Date & Time</label>
                <div className="relative custom-datepicker">
                   <DatePicker
                     selected={startDate}
                     onChange={(date:any) => setStartDate(date)}
                     showTimeSelect
                     dateFormat="MMMM d, yyyy h:mm aa"
                     className="w-full bg-background border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-primary transition-colors text-sm"
                     required
                   />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm text-gray-400 font-medium flex items-center gap-2"><Globe className="w-4 h-4 text-accent" /> Timezone</label>
                <div className="timezone-wrapper">
                  <TimezoneSelect
                    value={selectedTimezone}
                    onChange={setSelectedTimezone}
                    styles={{
                      control: (base) => ({
                        ...base,
                        backgroundColor: 'var(--background)',
                        borderColor: 'rgba(255,255,255,0.1)',
                        borderRadius: '0.5rem',
                        color: 'white',
                        fontSize: '0.875rem'
                      }),
                      menu: (base) => ({
                        ...base,
                        backgroundColor: 'var(--secondary)',
                        borderRadius: '0.5rem',
                        border: '1px solid rgba(255,255,255,0.1)',
                        zIndex: 50
                      }),
                      option: (base, state) => ({
                        ...base,
                        backgroundColor: state.isFocused ? 'rgba(var(--primary-rgb), 0.2)' : 'transparent',
                        color: 'white'
                      }),
                      singleValue: (base) => ({
                        ...base,
                        color: 'white'
                      })
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm text-gray-400 font-medium">Price (₹)</label>
                <div className="relative">
                   <IndianRupee className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
                   <input required type="number" step="0.01" min="0" value={newSession.price} onChange={e => setNewSession({...newSession, price: e.target.value})} 
                         className="w-full bg-background border border-white/10 rounded-lg pl-9 pr-4 py-2 text-white outline-none focus:border-primary transition-colors" />
                </div>
              </div>
              <div className="space-y-1">
                 <label className="text-sm text-gray-400 font-medium">Duration (min)</label>
                 <input required type="number" value={newSession.duration_minutes} onChange={e => setNewSession({...newSession, duration_minutes: parseInt(e.target.value)})} 
                        className="w-full bg-background border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-primary transition-colors" />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-1">
                <label className="text-sm text-gray-400 font-medium">Available Spots</label>
                <input required type="number" value={newSession.available_spots} onChange={e => setNewSession({...newSession, available_spots: parseInt(e.target.value)})} 
                       className="w-full bg-background border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-primary transition-colors" />
              </div>
            </div>

            <div className="space-y-1 pt-2">
              <label className="text-sm text-gray-400 font-medium flex items-center gap-2 mb-2"><ImageIcon className="w-4 h-4" /> Cover Image</label>
              <input key={imageFile ? 'has-file' : 'no-file'} type="file" accept="image/*" onChange={e => setImageFile(e.target.files?.[0] || null)} className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/20 file:text-primary hover:file:bg-primary/30 outline-none" />
            </div>

            <button type="submit" disabled={isCreating} className="w-full mt-6 bg-primary hover:bg-primary/90 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all">
               {isCreating ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Publish Session'}
            </button>
          </form>
        </div>

        {/* My Managed Sessions */}
        <div className="lg:col-span-2 space-y-8 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          
          <div className="glass-card p-6">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2 border-b border-white/5 pb-4">
              <Calendar className="text-primary" /> Manage My Sessions
            </h2>
            <div className="space-y-4">
              {sessions.map(s => (
                <div key={s.id} className="bg-background/80 border border-white/10 p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
                   <div className="flex items-center gap-4 w-full">
                     {s.image_url ? (
                        <img src={s.image_url} className="w-16 h-16 rounded-lg object-cover" />
                     ) : (
                        <div className="w-16 h-16 rounded-lg bg-secondary flex items-center justify-center"><Calendar className="text-gray-500" /></div>
                     )}
                     <div className="flex-1">
                       <h4 className="font-bold text-lg leading-tight">{s.title}</h4>
                       <div className="text-sm text-gray-400 flex items-center gap-3 mt-1">
                          <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {s.duration_minutes}m</span>
                           <span className="flex items-center gap-1">₹{s.price}</span>
                          <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {bookings.filter(b => b.session === s.id).length} / {s.available_spots} Booked</span>
                       </div>
                     </div>
                     <button 
                        onClick={async () => {
                           if (confirm('Are you sure you want to delete this session?')) {
                              try {
                                 await api.delete(`/catalog/sessions/${s.id}/`);
                                 setSessions(sessions.filter(sess => sess.id !== s.id));
                              } catch (e) {
                                  toast.error('Failed to delete session');
                              }
                           }
                        }}
                        className="p-2 hover:bg-destructive/10 text-destructive/60 hover:text-destructive rounded-lg transition-colors"
                     >
                        <Plus className="w-5 h-5 rotate-45" />
                     </button>
                   </div>
                </div>
              ))}
              {sessions.length === 0 && <div className="text-center text-gray-500 py-4">You have not created any sessions yet.</div>}
            </div>
          </div>

          <div className="glass-card p-6">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2 border-b border-white/5 pb-4">
              <Users className="text-accent" /> Recent Bookings
            </h2>
            <div className="space-y-4">
              {bookings.filter(b => sessions.some(s => s.id === b.session)).map(b => {
                 const relatedSession = sessions.find(s => s.id === b.session);
                 return (
                   <div key={b.id} className="bg-background/80 border border-white/10 p-4 rounded-xl flex items-center justify-between">
                     <div>
                       <p className="font-medium">{b.user_details.first_name} booked <span className="text-primary">{relatedSession?.title}</span></p>
                       <p className="text-xs text-gray-500 mt-1">{new Date(b.created_at).toLocaleString()}</p>
                     </div>
                     <span className={`text-xs font-bold px-2 py-1 rounded ${b.is_paid ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'}`}>
                        {b.is_paid ? 'PAID' : 'PENDING'}
                     </span>
                   </div>
                 )
              })}
              {bookings.filter(b => sessions.some(s => s.id === b.session)).length === 0 && <div className="text-center text-gray-500 py-4">No recent bookings.</div>}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
