import { useState } from 'react';
import useAuthStore from '../store/authStore';
import api from '../lib/axios';
import { Save, Loader2, Camera, User, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export default function Profile() {
  const { user, checkAuth } = useAuthStore();
  const navigate = useNavigate();
  const [updating, setUpdating] = useState(false);
  
  const [firstName, setFirstName] = useState(user?.first_name || '');
  const [lastName, setLastName] = useState(user?.last_name || '');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatar_url || null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setUpdating(true);
    const formData = new FormData();
    formData.append('first_name', firstName);
    formData.append('last_name', lastName);
    if (avatarFile) formData.append('avatar', avatarFile);

    try {
      await api.patch('/users/profile/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      await checkAuth(); // refresh user
      setAvatarFile(null);
      toast.success('Profile updated successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to update profile');
    } finally {
      setUpdating(false);
    }
  };

  const onAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setAvatarPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-32">
      <button onClick={() => navigate(-1)} className="flex items-center text-gray-400 hover:text-white mb-8 transition-colors font-medium">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back
      </button>

      <h1 className="text-4xl font-extrabold mb-8 tracking-tight">Edit <span className="text-primary">Profile</span></h1>
      
      <div className="glass-card p-8 animate-fade-in-up">
        <h2 className="text-xl font-bold mb-8 flex items-center gap-2 border-b border-white/5 pb-4">
           <User className="text-accent" /> Public Information
        </h2>
        <form onSubmit={handleProfileUpdate} className="space-y-6">
           <div className="flex flex-col items-center mb-8">
              <div className="relative group w-32 h-32 rounded-full overflow-hidden border-4 border-white/10 shadow-2xl">
                 {avatarPreview ? (
                    <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                 ) : (
                    <div className="w-full h-full bg-secondary flex items-center justify-center">
                       <User className="w-12 h-12 text-gray-400" />
                    </div>
                 )}
                 <label className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <Camera className="w-8 h-8 text-white mb-2" />
                    <span className="text-xs text-white font-bold uppercase tracking-wider">Change Photo</span>
                    <input type="file" className="hidden" accept="image/*" onChange={onAvatarChange} />
                 </label>
              </div>
              <p className="text-sm text-gray-500 mt-4">Upload a profile picture to personalize your account</p>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                 <label className="text-sm text-gray-400 font-bold uppercase tracking-widest">First Name</label>
                 <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} 
                        className="w-full bg-background/50 border border-white/10 rounded-xl px-5 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium" 
                        placeholder="John" />
              </div>
              <div className="space-y-2">
                 <label className="text-sm text-gray-400 font-bold uppercase tracking-widest">Last Name</label>
                 <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} 
                        className="w-full bg-background/50 border border-white/10 rounded-xl px-5 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium" 
                        placeholder="Doe" />
              </div>
           </div>

           <div className="pt-6">
              <button type="submit" disabled={updating} 
                      className="w-full bg-primary text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-primary/20 hover:bg-primary/90 active:scale-[0.98] flex items-center justify-center gap-3">
                 {updating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                 Update Profile
              </button>
           </div>
        </form>
      </div>
    </div>
  );
}
