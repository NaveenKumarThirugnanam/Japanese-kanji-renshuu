from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import KanjiViewSet

router = DefaultRouter()
router.register('kanji', KanjiViewSet, basename='kanji')

urlpatterns = [
    path('', include(router.urls)),
]
