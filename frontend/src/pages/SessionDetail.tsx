import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../lib/axios';
import useAuthStore from '../store/authStore';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Calendar, Clock, User, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

import { Session } from './Home';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_dummy_key');

interface Booking {
  id: number;
  is_paid?: boolean;
}

interface CheckoutFormProps {
  session: Session;
  booking: Booking;
  onComplete: () => void;
}

function CheckoutForm({ session, booking, onComplete }: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setLoading(true);

    try {
      if (!booking || !booking.id) throw new Error('Booking not initialized');
      const { data } = await api.post(`/bookings/bookings/${booking.id}/create_payment_intent/`);
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) throw new Error('Card element not found');

      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(data.clientSecret, {
        payment_method: { card: cardElement },
      });

      if (stripeError) throw new Error(stripeError.message);
      if (paymentIntent.status === 'succeeded') {
        // Confirm payment on backend to mark booking as paid
        await api.post(`/bookings/bookings/${booking.id}/confirm_payment/`);
        toast.success('Payment successful! Session booked.');
        onComplete();
      }
    } catch (err: any) {
      toast.error(err.message || 'Payment failed');
      setError(err.message || 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 bg-secondary/30 rounded-xl border border-white/5 space-y-4">
      <h3 className="text-xl font-bold mb-4">Complete Payment</h3>
      <div className="p-4 bg-background rounded-lg border border-white/10">
        <CardElement options={{ style: { base: { color: '#fff', fontSize: '16px' } } }} />
      </div>
      {error && <div className="text-destructive text-sm bg-destructive/10 p-2 rounded">{error}</div>}
      <button disabled={!stripe || loading} className="w-full bg-primary hover:bg-primary/80 disabled:opacity-50 text-white font-semibold py-3 flex items-center justify-center rounded-xl transition-all shadow-lg shadow-primary/20">
        {loading ? <Loader2 className="animate-spin w-5 h-5 mr-2" /> : `Pay ₹${session.price}`}
      </button>
    </form>
  );
}

export default function SessionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [checkingOut, setCheckingOut] = useState(false);
  const [success, setSuccess] = useState(false);
  const [alreadyBooked, setAlreadyBooked] = useState(false);

  useEffect(() => {
    api.get(`/catalog/sessions/${id}/`)
      .then(res => setSession(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  // Check if user already booked this session
  useEffect(() => {
    if (isAuthenticated && id) {
      api.get(`/bookings/bookings/check_booking/?session_id=${id}`)
        .then(res => {
          if (res.data.booked) {
            setAlreadyBooked(true);
            setBooking(res.data.booking);
            if (res.data.is_paid) {
              setSuccess(true);
            }
          }
        })
        .catch(() => {}); // silently fail if not authenticated
    }
  }, [isAuthenticated, id]);

  const handleBook = async () => {
    if (!isAuthenticated) return navigate('/login');
    if (!session) return;
    try {
      const res = await api.post('/bookings/bookings/', { session: session.id });
      setBooking(res.data);
      if (parseFloat(session.price) > 0) {
        setCheckingOut(true);
      } else {
        toast.success('Session booked successfully!');
        setSuccess(true);
      }
    } catch (e: any) {
      // If booking already exists, the response returns the existing booking
      if (e.response?.data?.booking) {
        setAlreadyBooked(true);
        setBooking(e.response.data.booking);
      } else {
        console.error(e);
        toast.error('Failed to book session');
      }
    }
  };

  if (loading) return <div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  if (!session) return <div className="p-12 text-center text-destructive font-semibold">Session not found</div>;
  return (
    <div className="max-w-4xl mx-auto px-6 py-12 animate-fade-in-up">
      <button onClick={() => navigate(-1)} className="flex items-center text-gray-400 hover:text-white mb-6 transition-colors font-medium">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Catalog
      </button>

      <div className="glass-card overflow-hidden">
        {session.image_url && (
          <div className="h-64 md:h-80 w-full relative">
            <img
              src={session.image_url}
              alt={session.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
          </div>
        )}

        <div className="p-8 md:p-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 border-b border-white/5 pb-8">
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-white drop-shadow-lg">{session.title}</h1>
              <div className="flex flex-wrap items-center gap-6 text-sm text-gray-300 font-medium">
                <div className="flex items-center gap-2"><User className="w-5 h-5 text-primary" />{session.creator_details?.first_name || 'Creator'}</div>
                <div className="flex items-center gap-2"><Clock className="w-5 h-5 text-accent" />{session.duration_minutes} Minutes</div>
                <div className="flex items-center gap-2"><Calendar className="w-5 h-5 text-pink-500" />{new Date(session.date).toLocaleString()}</div>
              </div>
            </div>
            <div className="text-left md:text-right bg-secondary/30 px-6 py-4 rounded-2xl border border-white/5 shadow-inner">
              <div className="text-sm text-gray-400 mb-1 uppercase tracking-wider font-semibold">Price</div>
              <div className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-emerald-500">₹{session.price}</div>
            </div>
          </div>

          <div className="prose prose-invert max-w-none mb-12">
            <h3 className="text-xl font-bold mb-4 text-white flex items-center gap-2">
              <div className="w-1.5 h-6 bg-primary rounded-full"></div>
              About this session
            </h3>
            <p className="text-gray-300 leading-relaxed whitespace-pre-wrap text-lg opacity-90">{session.description}</p>
          </div>

          {/* Already booked message */}
          {alreadyBooked && !success && !checkingOut && (
            <div className="bg-gradient-to-r from-blue-500/20 to-indigo-500/10 border border-blue-500/20 text-blue-400 p-6 rounded-2xl flex items-center justify-center gap-3 text-lg font-medium animate-fade-in-up shadow-xl shadow-blue-500/5">
              <div className="bg-blue-500/20 p-2 rounded-full"><CheckCircle2 className="w-6 h-6 text-blue-400" /></div>
              You have already booked this session. {booking?.is_paid ? 'Payment confirmed.' : 'Payment pending.'}
            </div>
          )}

          {!success && !checkingOut && !alreadyBooked && (
            <div className="flex justify-start">
              <button onClick={handleBook} className="w-full md:w-auto bg-primary hover:bg-primary/90 text-white font-bold py-4 px-12 rounded-full text-lg shadow-[0_0_30px_-5px_var(--primary)] transition-transform hover:scale-[1.02]">
                Book Spot Now
              </button>
            </div>
          )}

          {checkingOut && !success && booking && (
            <div className="mt-8 animate-fade-in-up">
              <Elements stripe={stripePromise}>
                <CheckoutForm session={session} booking={booking} onComplete={() => setSuccess(true)} />
              </Elements>
            </div>
          )}

          {success && (
            <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/10 border border-green-500/20 text-green-400 p-6 rounded-2xl flex items-center justify-center gap-3 text-lg font-medium animate-fade-in-up shadow-xl shadow-green-500/5">
              <div className="bg-green-500/20 p-2 rounded-full"><CheckCircle2 className="w-6 h-6 text-green-400" /></div>
              Successfully booked! Check your dashboard for details.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
