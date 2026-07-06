from django.db import models


class Kanji(models.Model):
    number = models.PositiveIntegerField(unique=True, db_index=True)
    character = models.CharField(max_length=4, unique=True, db_index=True)
    stroke_svg = models.TextField(blank=True, default='')

    class Meta:
        ordering = ['number']

    def __str__(self):
        return f'#{self.number} {self.character}'


class Compound(models.Model):
    kanji = models.ForeignKey(Kanji, on_delete=models.CASCADE, related_name='compounds')
    word = models.CharField(max_length=20, db_index=True)
    reading = models.CharField(max_length=40, db_index=True)

    class Meta:
        ordering = ['id']

    def __str__(self):
        return f'{self.word} ({self.reading})'
