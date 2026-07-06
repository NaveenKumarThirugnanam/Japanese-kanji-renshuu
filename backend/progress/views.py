from rest_framework import mixins, viewsets
from .models import StudySession
from .serializers import StudySessionSerializer


class StudySessionViewSet(mixins.CreateModelMixin, mixins.ListModelMixin, viewsets.GenericViewSet):
    serializer_class = StudySessionSerializer

    def get_queryset(self):
        client_id = self.request.query_params.get('client_id', '')
        if not client_id:
            return StudySession.objects.none()
        return StudySession.objects.filter(client_id=client_id)
