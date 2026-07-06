from django.db import models


class StudySession(models.Model):
    """
    Records one completed study session for a kanji range.
    Keyed by a client-generated UUID stored in localStorage — no auth required.
    When you add user accounts later, replace client_id with a ForeignKey to User.
    """
    client_id = models.CharField(max_length=64, db_index=True)
    range_from = models.PositiveIntegerField()
    range_to = models.PositiveIntegerField()
    mode = models.CharField(max_length=8)  # w2r | r2w | mix
    total = models.PositiveIntegerField()
    correct = models.PositiveIntegerField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        pct = round(self.correct / self.total * 100) if self.total else 0
        return f'{self.range_from}-{self.range_to} {pct}% ({self.created_at:%Y-%m-%d})'
