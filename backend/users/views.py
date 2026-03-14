from rest_framework import status, views, permissions, generics
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.conf import settings
from .models import CustomUser
from rest_framework_simplejwt.tokens import RefreshToken
import requests
from .serializers import UserSerializer

class GoogleLoginView(views.APIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        token = request.data.get('access_token')
        if not token:
            return Response({'error': 'No token provided'}, status=status.HTTP_400_BAD_REQUEST)

        google_url = f'https://www.googleapis.com/oauth2/v3/userinfo?access_token={token}'
        res = requests.get(google_url)
        if not res.ok:
            return Response({'error': 'Invalid Google token'}, status=status.HTTP_400_BAD_REQUEST)

        user_data = res.json()
        email = user_data.get('email')
        first_name = user_data.get('given_name', '')
        last_name = user_data.get('family_name', '')

        if not email:
            return Response({'error': 'Email not provided by Google'}, status=status.HTTP_400_BAD_REQUEST)

        user, created = CustomUser.objects.get_or_create(email=email, defaults={
            'username': email.split('@')[0],
            'first_name': first_name,
            'last_name': last_name,
        })

        # Update name fields if user already exists but name is missing
        if not created:
            updated = False
            if not user.first_name and first_name:
                user.first_name = first_name
                updated = True
            if not user.last_name and last_name:
                user.last_name = last_name
                updated = True
            if updated:
                user.save()

        refresh = RefreshToken.for_user(user)

        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': UserSerializer(user).data
        })

class UserProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = (permissions.IsAuthenticated,)
    parser_classes = (MultiPartParser, FormParser, JSONParser)

    def get_object(self):
        return self.request.user
