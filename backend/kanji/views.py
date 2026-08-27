from django.db.models import Q
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Kanji
from .serializers import KanjiSerializer


class KanjiViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = KanjiSerializer

    def get_queryset(self):
        qs = Kanji.objects.prefetch_related('compounds')
        from_n = self.request.query_params.get('from')
        to_n = self.request.query_params.get('to')
        if from_n and to_n:
            try:
                qs = qs.filter(number__gte=int(from_n), number__lte=int(to_n))
            except ValueError:
                pass
        return qs

    @action(detail=False, methods=['get'])
    def search(self, request):
        q = request.query_params.get('q', '').strip()
        if not q:
            return Response([])

        qs = (
            Kanji.objects
            .prefetch_related('compounds')
            .filter(
                Q(character=q) |
                Q(compounds__word__icontains=q) |
                Q(compounds__reading__icontains=q)
            )
            .distinct()[:30]
        )

        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def stroke(self, request):
        character = request.query_params.get('character', '')
        if not character:
            return Response({'error': 'character param required'}, status=400)
        try:
            kanji = Kanji.objects.only('stroke_svg').get(character=character)
            return Response({'svg': kanji.stroke_svg or None})
        except Kanji.DoesNotExist:
            return Response({'error': 'not found'}, status=404)

    @action(detail=False, methods=['get'])
    def ranges(self, request):
        """Return the 21 predefined study ranges."""
        RANGES = [
            [1, 50], [51, 100], [101, 150], [151, 200], [201, 250],
            [251, 300], [301, 350], [351, 400], [401, 450], [451, 500],
            [501, 550], [551, 600], [601, 650], [651, 700], [701, 750],
            [751, 800], [801, 850], [851, 900], [901, 950], [951, 1000],
            [1001, 1046],
        ]
        return Response([{'from': a, 'to': b} for a, b in RANGES])
