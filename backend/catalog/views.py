from rest_framework import viewsets
from .models import Session
from .serializers import SessionSerializer
from .permissions import IsCreatorOrReadOnly

class SessionViewSet(viewsets.ModelViewSet):
    queryset = Session.objects.all().order_by('date')
    serializer_class = SessionSerializer
    permission_classes = [IsCreatorOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(creator=self.request.user)
