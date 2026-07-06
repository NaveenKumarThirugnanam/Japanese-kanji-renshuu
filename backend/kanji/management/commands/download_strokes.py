"""
Download KanjiVG stroke order SVGs for all kanji in the database.
Requires internet. Run once; data is stored in the DB for offline use.

Usage:
    python manage.py download_strokes
    python manage.py download_strokes --force   # re-download even if already stored
"""
import time
import urllib.request
import urllib.error

from django.core.management.base import BaseCommand

from kanji.models import Kanji

KANJIVG_URL = 'https://raw.githubusercontent.com/KanjiVG/kanjivg/master/kanji/{}.svg'


class Command(BaseCommand):
    help = 'Download KanjiVG stroke order SVGs from GitHub and store them in the DB'

    def add_arguments(self, parser):
        parser.add_argument(
            '--force',
            action='store_true',
            help='Re-download even if stroke_svg is already populated',
        )

    def handle(self, *args, **options):
        qs = Kanji.objects.all() if options['force'] else Kanji.objects.filter(stroke_svg='')
        total = qs.count()

        if total == 0:
            self.stdout.write('All stroke SVGs already downloaded. Use --force to re-download.')
            return

        self.stdout.write(f'Downloading stroke data for {total} kanji...')

        ok = 0
        fail = 0
        to_update = []

        for k in qs:
            hex_code = format(ord(k.character), '05x')
            url = KANJIVG_URL.format(hex_code)
            try:
                req = urllib.request.Request(url, headers={'User-Agent': 'kanji-renshuu/1.0'})
                with urllib.request.urlopen(req, timeout=15) as resp:
                    k.stroke_svg = resp.read().decode('utf-8')
                to_update.append(k)
                ok += 1
                if ok % 100 == 0:
                    Kanji.objects.bulk_update(to_update, ['stroke_svg'])
                    to_update = []
                    self.stdout.write(f'  {ok}/{total}...')
                time.sleep(0.05)
            except urllib.error.HTTPError as e:
                fail += 1
                self.stdout.write(f'  SKIP #{k.number} {k.character}: HTTP {e.code}')
            except Exception as e:
                fail += 1
                self.stdout.write(f'  FAIL #{k.number} {k.character}: {e}')

        if to_update:
            Kanji.objects.bulk_update(to_update, ['stroke_svg'])

        self.stdout.write(self.style.SUCCESS(
            f'Done. {ok} downloaded, {fail} failed (kanji not in KanjiVG dataset).'
        ))
