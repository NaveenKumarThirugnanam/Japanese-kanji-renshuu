from rest_framework import serializers
from .models import Kanji, Compound


class CompoundSerializer(serializers.ModelSerializer):
    class Meta:
        model = Compound
        fields = ['word', 'reading']


class KanjiSerializer(serializers.ModelSerializer):
    compounds = CompoundSerializer(many=True, read_only=True)

    class Meta:
        model = Kanji
        fields = ['number', 'character', 'compounds']
