"""
Load kanji data from the original N2_Kanji_Anki.html file.

Usage:
    python manage.py load_kanji path/to/N2_Kanji_Anki.html
"""
import json
import re
from pathlib import Path

from django.core.management.base import BaseCommand, CommandError
from django.db import transaction

from kanji.models import Compound, Kanji


class Command(BaseCommand):
    help = 'Load kanji data from the original N2_Kanji_Anki.html file'

    def add_arguments(self, parser):
        parser.add_argument(
            'html_file',
            type=str,
            help='Path to N2_Kanji_Anki.html',
        )

    def handle(self, *args, **options):
        html_path = Path(options['html_file'])
        if not html_path.exists():
            raise CommandError(f'File not found: {html_path}')

        self.stdout.write(f'Reading {html_path} ...')
        content = html_path.read_text(encoding='utf-8')

        match = re.search(r'const KANJI_RAW\s*=\s*(\[[\s\S]*?\]);', content)
        if not match:
            raise CommandError('Could not find KANJI_RAW in the file.')

        try:
            data = json.loads(match.group(1))
        except json.JSONDecodeError as exc:
            raise CommandError(f'Failed to parse KANJI_RAW: {exc}')

        self.stdout.write(f'Found {len(data)} kanji entries. Loading...')

        with transaction.atomic():
            Compound.objects.all().delete()
            Kanji.objects.all().delete()

            kanji_objs = []
            compound_objs = []

            for entry in data:
                num, character, compounds = entry
                k = Kanji(number=num, character=character)
                kanji_objs.append(k)

            Kanji.objects.bulk_create(kanji_objs)

            kanji_map = {k.number: k for k in Kanji.objects.all()}

            for entry in data:
                num, _char, compounds = entry
                k = kanji_map[num]
                for word, reading in compounds:
                    compound_objs.append(Compound(kanji=k, word=word, reading=reading))

            Compound.objects.bulk_create(compound_objs, batch_size=500)

        kanji_count = Kanji.objects.count()
        compound_count = Compound.objects.count()
        self.stdout.write(
            self.style.SUCCESS(
                f'Done. {kanji_count} kanji, {compound_count} compounds loaded.'
            )
        )
