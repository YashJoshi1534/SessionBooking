from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.conf import settings
from .models import Booking
from .serializers import BookingSerializer
import stripe
import os

stripe.api_key = getattr(settings, 'STRIPE_SECRET_KEY', os.environ.get('STRIPE_SECRET_KEY', 'sk_test_dummy'))

class BookingViewSet(viewsets.ModelViewSet):
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'CREATOR':
            return (Booking.objects.filter(session__creator=user) | Booking.objects.filter(user=user)).distinct()
        return Booking.objects.filter(user=user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def create(self, request, *args, **kwargs):
        """Override create to prevent duplicate bookings."""
        session_id = request.data.get('session')
        if session_id and Booking.objects.filter(user=request.user, session_id=session_id).exists():
            existing = Booking.objects.filter(user=request.user, session_id=session_id).first()
            return Response(
                BookingSerializer(existing).data,
                status=status.HTTP_200_OK
            )
        return super().create(request, *args, **kwargs)

    @action(detail=True, methods=['post'])
    def create_payment_intent(self, request, pk=None):
        booking = self.get_object()
        if booking.is_paid:
            return Response({'error': 'Already paid'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            price = float(booking.session.price)
            amount = int(price * 100)  # Convert to paise for INR

            if amount < 50 and amount > 0:
                amount = 50  # Minimum Stripe amount
            elif amount <= 0:
                return Response({'error': 'Free sessions do not require payment intent'}, status=status.HTTP_400_BAD_REQUEST)

            intent = stripe.PaymentIntent.create(
                amount=amount,
                currency='inr',
                metadata={'booking_id': booking.id},
                description=f"Session: {booking.session.title}"
            )
            booking.payment_intent_id = intent.id
            booking.save()
            return Response({'clientSecret': intent.client_secret})
        except stripe.error.AuthenticationError:
            return Response({'error': 'Invalid Stripe API Key. Please provide a valid test key in settings.'}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def confirm_payment(self, request, pk=None):
        """Mark booking as paid after successful Stripe payment on frontend."""
        booking = self.get_object()
        if booking.is_paid:
            return Response({'status': 'already_paid'})

        payment_intent_id = booking.payment_intent_id
        if not payment_intent_id:
            return Response({'error': 'No payment intent found'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            intent = stripe.PaymentIntent.retrieve(payment_intent_id)
            if intent.status == 'succeeded':
                booking.is_paid = True
                booking.save()
                return Response({'status': 'paid'})
            else:
                return Response({'error': f'Payment not yet succeeded. Status: {intent.status}'}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'])
    def check_booking(self, request):
        """Check if the current user already has a booking for a given session."""
        session_id = request.query_params.get('session_id')
        if not session_id:
            return Response({'error': 'session_id is required'}, status=status.HTTP_400_BAD_REQUEST)
        booking = Booking.objects.filter(user=request.user, session_id=session_id).first()
        if booking:
            return Response({'booked': True, 'is_paid': booking.is_paid, 'booking': BookingSerializer(booking).data})
        return Response({'booked': False})
