from django.urls import path
from .views import GoogleLoginView, UserProfileView

urlpatterns = [
    path('auth/google/', GoogleLoginView.as_view(), name='google-login'),
    path('profile/', UserProfileView.as_view(), name='user-profile'),
]
