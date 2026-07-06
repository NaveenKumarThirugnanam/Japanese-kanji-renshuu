from rest_framework import serializers
from .models import StudySession


class StudySessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudySession
        fields = ['id', 'client_id', 'range_from', 'range_to', 'mode', 'total', 'correct', 'created_at']
        read_only_fields = ['id', 'created_at']
