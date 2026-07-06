from django.contrib import admin
from .models import Kanji, Compound


class CompoundInline(admin.TabularInline):
    model = Compound
    extra = 0


@admin.register(Kanji)
class KanjiAdmin(admin.ModelAdmin):
    list_display = ['number', 'character']
    search_fields = ['character', 'compounds__word']
    inlines = [CompoundInline]


@admin.register(Compound)
class CompoundAdmin(admin.ModelAdmin):
    list_display = ['word', 'reading', 'kanji']
    search_fields = ['word', 'reading']
    list_select_related = ['kanji']
