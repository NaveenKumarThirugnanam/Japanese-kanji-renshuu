from django.contrib import admin
from .models import StudySession


@admin.register(StudySession)
class StudySessionAdmin(admin.ModelAdmin):
    list_display = ['client_id', 'range_from', 'range_to', 'mode', 'correct', 'total', 'created_at']
    list_filter = ['mode']
    readonly_fields = ['created_at']
