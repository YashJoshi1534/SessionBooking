from rest_framework import serializers
from .models import Booking
from catalog.serializers import SessionSerializer
from users.serializers import UserSerializer

class BookingSerializer(serializers.ModelSerializer):
    session_details = SessionSerializer(source='session', read_only=True)
    user_details = UserSerializer(source='user', read_only=True)

    class Meta:
        model = Booking
        fields = '__all__'
        read_only_fields = ('user', 'is_paid', 'payment_intent_id')
