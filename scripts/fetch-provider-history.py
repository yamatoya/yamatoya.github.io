#!/usr/bin/env python3
# coding: utf-8
"""Archive the official historical comparison sources listed in discovery.json.

No credentials or private endpoints are used. The original announcement HTML is
stored as .html.txt so it cannot execute as a page on the application's origin.
"""
from pathlib import Path
from urllib.parse import urlparse, unquote
import concurrent.futures
import hashlib
import json
import subprocess

ROOT = Path(__file__).resolve().parents[1]
ARCHIVE = ROOT / 'docs/provider-history/2026-11-23'


def download(source):
    url = source['url']
    host = urlparse(url).hostname
    if host not in {'www.sbivc.co.jp', 'jp-news.mercari.com', 'images.microcms-assets.io'}:
        raise ValueError('Unexpected official source host: ' + str(host))
    suffix = Path(unquote(urlparse(url).path)).suffix.lower()
    if suffix not in {'.pdf', '.jpg', '.jpeg', '.png'}:
        raise ValueError('Unexpected source format: ' + url)
    name = hashlib.sha256(url.encode()).hexdigest()[:16] + suffix
    path = ARCHIVE / 'sources' / name
    if not path.exists():
        result = subprocess.run(['curl', '-fsSL', '--max-time', '45', '--retry', '1', url, '-o', str(path)], capture_output=True)
        if result.returncode:
            if path.exists(): path.unlink()
            return {**source, 'error': result.stderr.decode().strip()}
    data = path.read_bytes()
    if suffix == '.pdf' and not data.startswith(b'%PDF'):
        raise ValueError('Invalid PDF: ' + url)
    return {**source, 'file': name, 'bytes': len(data), 'sha256': hashlib.sha256(data).hexdigest()}


def main():
    discovery = json.loads((ARCHIVE / 'discovery.json').read_text())
    unique = {source['url']: source for record in discovery['announcements'] for source in record['attachments']}
    with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:
        sources = list(pool.map(download, unique.values()))
    by_url = {source['url']: source for source in sources}
    for record in discovery['announcements']:
        original = ARCHIVE / 'sources' / record['original']
        data = original.read_bytes()
        record['originalSha256'] = hashlib.sha256(data).hexdigest()
        record['attachments'] = [by_url[source['url']] for source in record['attachments']]
    (ARCHIVE / 'manifest.json').write_text(json.dumps(discovery, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(json.dumps({'announcements': len(discovery['announcements']), 'downloaded': sum('file' in source for source in sources),
                      'failed': [source for source in sources if 'error' in source]}, ensure_ascii=False))


if __name__ == '__main__': main()
