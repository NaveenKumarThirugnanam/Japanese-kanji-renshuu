from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import StudySessionViewSet

router = DefaultRouter()
router.register('sessions', StudySessionViewSet, basename='sessions')

urlpatterns = [
    path('', include(router.urls)),
]
