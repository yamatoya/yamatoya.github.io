#!/usr/bin/env python3
# coding: utf-8
"""Import historical public comparisons without inventing missing full versions.

Requires lxml and pdfplumber. Run fetch-provider-history.py first when refreshing
the archived sources; this command is offline and verifies every source hash.
"""
from pathlib import Path
from collections import Counter
import hashlib
import html as escape_html
import json
import re
import unicodedata
import warnings
from lxml import html
import pdfplumber

ROOT = Path(__file__).resolve().parents[1]
ARCHIVE = ROOT / 'docs/provider-history/2026-11-23'
BASE = '/docs/provider-history/2026-11-23/sources/'
SBIDOCS = {
    'covenants-ex_tt': 'sbivc-service-terms', 'manual-ex_tt': 'sbivc-crypto-manual',
    'manual-ex_electric-payment-instrument': 'sbivc-payment-manual',
    'lending_covenants_tt': 'sbivc-lending-terms', 'lending_manual-ex_tt': 'sbivc-lending-manual',
    'sbiweb3wallet_covenants': 'sbivc-web3-terms', 'bestexecutionpolicy': 'sbivc-best-execution',
    'privacy-policy': 'sbivc-privacy-policy', 'privacy': 'sbivc-privacy-handling',
}
SBI_NAMES = {
    'サービス総合約款': 'sbivc-service-terms', '暗号資産取引説明書': 'sbivc-crypto-manual',
    '電子決済手段取引説明書': 'sbivc-payment-manual', '暗号資産等貸借取引約款': 'sbivc-lending-terms',
    '暗号資産貸借取引約款': 'sbivc-lending-terms', '暗号資産等貸借取引説明書': 'sbivc-lending-manual',
    '暗号資産貸借取引説明書': 'sbivc-lending-manual', 'SBIWeb3ウォレットサービス約款': 'sbivc-web3-terms',
    '最良執行方針': 'sbivc-best-execution', '個人情報保護方針': 'sbivc-privacy-policy',
    '個人情報のお取扱い': 'sbivc-privacy-handling',
}
MC_NAMES = {
    '暗号資産つみたて利用規約': 'mercoin_auto_invest_tos', '暗号資産つみたて取引説明書': 'mercoin_auto_invest_es',
    '暗号資産取引利用規約': 'mercoin_tos', '暗号資産取引説明書': 'mercoin_es',
    '暗号資産取引プライバシーポリシー': 'mercoin_pp',
}


def compact(text): return re.sub(r'\s+', '', unicodedata.normalize('NFKC', text or ''))


def text(node):
    if node.tag in {'script', 'style', 'noscript'} or 'p-toc' in node.get('class', ''): return ''
    result = node.text or ''
    for child in node:
        result += text(child) + (child.tail or '')
    if node.tag in {'br', 'p', 'div', 'h2', 'h3', 'h4', 'h5', 'li', 'tr', 'td', 'th'}: result += '\n'
    return result


def rich(value): return escape_html.escape(value.strip()).replace('\n', '<br>')


def dates(value):
    value = unicodedata.normalize('NFKC', value)
    return ['%04d-%02d-%02d' % tuple(map(int, match)) for match in re.findall(r'(20\d{2})\s*年\s*(\d{1,2})\s*月\s*(\d{1,2})\s*日', value)]


def doc_ids(value, names):
    normalized = compact(value)
    found = [doc for name, doc in names.items() if compact(name) in normalized]
    return list(dict.fromkeys(found))


def pdf_doc_ids(url, label):
    # Test longer names first so privacy-policy and lending manuals do not get
    # silently assigned to their differently scoped parent documents.
    named = doc_ids(label, SBI_NAMES)
    if named: return named
    name = url.rsplit('/', 1)[-1].replace('_ex_tt', '-ex_tt')
    for token, doc in sorted(SBIDOCS.items(), key=lambda item: -len(item[0])):
        if token in name: return [doc]
    return doc_ids(label, SBI_NAMES)


def nearest_heading(node):
    headings = node.xpath('preceding::h2|preceding::h3|preceding::h4|preceding::h5')
    relevant = [heading for heading in headings if heading.getparent() is not None]
    return ' / '.join(' '.join(heading.text_content().split()) for heading in relevant[-3:])


def pdf_segments(source, event):
    result, unresolved = [], []
    remembered = None
    with pdfplumber.open(ARCHIVE / 'sources' / source['file']) as pdf:
        for number, page in enumerate(pdf.pages, 1):
            tables = [table for table in page.find_tables() if len(table.columns) >= 2 and table.bbox[2] - table.bbox[0] > page.width * .55]
            table = max(tables, key=lambda table: (table.bbox[2] - table.bbox[0]) * (table.bbox[3] - table.bbox[1]), default=None)
            columns = {}
            if table:
                for row in table.rows[:2]:
                    for cell in row.cells:
                        if not cell: continue
                        label = compact(page.crop(cell).extract_text() or '')
                        if re.fullmatch(r'(?:改定後|改正後|変更後)', label): columns['after'] = cell
                        if re.fullmatch(r'(?:現行|改定前|改正前|変更前)', label): columns['before'] = cell
                    if len(columns) == 2: break
            if len(columns) == 2:
                remembered = {key: (box[0] / page.width, box[2] / page.width) for key, box in columns.items()}
                top = max(box[3] for box in columns.values())
            elif remembered and table:
                columns = {key: (left * page.width, table.bbox[1], right * page.width, table.bbox[1]) for key, (left, right) in remembered.items()}
                top = table.bbox[1]
            else:
                unresolved.append(number)
                continue
            bottom = table.bbox[3]
            contents = {key: page.crop((box[0] + .5, top + .5, box[2] - .5, bottom)).extract_text(x_tolerance=2, y_tolerance=3) or '' for key, box in columns.items()}
            if not any(value.strip() for value in contents.values()):
                unresolved.append(number); continue
            result.append({
                'id': source['file'] + '-p' + str(number), 'label': '新旧対照表 ' + str(number) + 'ページ',
                'docIds': source['docIds'], 'before': rich(contents.get('before', '')), 'after': rich(contents.get('after', '')),
                'beforeKnown': True, 'afterKnown': True, 'coverage': 'changed-excerpts',
                'source': BASE + source['file'] + '#page=' + str(number), 'sourceUrl': source['url'], 'page': number,
            })
    return result, unresolved


def mercoin_segments(body, event):
    segments = []
    for number, table in enumerate(body.xpath('.//table'), 1):
        rows = table.xpath('./tbody/tr|./tr|./thead/tr')
        if not rows: continue
        header = [compact(cell.text_content()) for cell in rows[0].xpath('./td|./th')]
        before_at = next((i for i, label in enumerate(header) if label in {'改定前', '改正前', '現行'}), None)
        after_at = next((i for i, label in enumerate(header) if re.fullmatch(r'改[定正]後(?:\(新設\))?', label)), None)
        if after_at is None: continue
        label = nearest_heading(table)
        values = {'before': [], 'after': []}
        for row in rows[1:]:
            cells = row.xpath('./td|./th')
            for side, at in [('before', before_at), ('after', after_at)]:
                if at is not None and at < len(cells): values[side].append(text(cells[at]).strip())
        if not any(values.values()): continue
        segments.append({
            'id': event['id'] + '-table-' + str(number), 'label': label or '新旧対照表 ' + str(number),
            'docIds': doc_ids(label, MC_NAMES) or event['docIds'],
            'before': rich('\n\n'.join(values['before'])), 'after': rich('\n\n'.join(values['after'])),
            'beforeKnown': before_at is not None or any('新設' in value for value in header), 'afterKnown': True,
            'coverage': 'changed-excerpts', 'source': event['source'], 'sourceUrl': event['url'],
        })
    # Older announcements use paragraphs instead of HTML tables.
    plain = text(body)
    label_before = re.compile(r'(?:^|\n)\s*改[定訂正]前[：:]?\s*\n')
    label_after = re.compile(r'(?:^|\n)\s*改[定訂正]後[：:]?\s*\n')
    endings = re.compile(r'\n\s*(?:改[定訂正]趣旨|改[定訂正]箇所|【改[定訂正]内容|暗号資産つみたて(?:利用規約|取引説明書)[「第]|20\d{2}年\d+月\d+日|以上です|その他|改定後の)')
    for number, start in enumerate(label_before.finditer(plain), 1):
        next_before = label_before.search(plain, start.end())
        after = label_after.search(plain, start.end(), next_before.start() if next_before else len(plain))
        if not after: continue
        end = endings.search(plain, after.end())
        end_at = min([value for value in [end.start() if end else len(plain), next_before.start() if next_before else len(plain)]])
        context = [line.strip() for line in plain[:start.start()].splitlines() if line.strip()]
        label = next((line for line in reversed(context[-12:]) if re.search('第.*条|改[定訂正]箇所|暗号資産|Ⅲ|Ⅱ', line)), '改定箇所 ' + str(number))
        segments.append({
            'id': event['id'] + '-paragraph-' + str(number), 'label': label,
            'docIds': doc_ids(label, MC_NAMES) or event['docIds'],
            'before': rich(plain[start.end():after.start()]), 'after': rich(plain[after.end():end_at]),
            'beforeKnown': True, 'afterKnown': True, 'coverage': 'changed-excerpts', 'source': event['source'], 'sourceUrl': event['url'],
        })
    return segments


def main():
    manifest = json.loads((ARCHIVE / 'manifest.json').read_text())
    events, extraction = [], []
    for record in manifest['announcements']:
        raw = (ARCHIVE / 'sources' / record['original']).read_bytes()
        assert hashlib.sha256(raw).hexdigest() == record['originalSha256']
        tree = html.fromstring(raw.decode('utf-8'))
        sbi = record['provider'] == 'SBI VCトレード'
        body = tree.xpath('//h2/parent::div')[0] if sbi else tree.xpath('//div[contains(concat(" ",normalize-space(@class)," ")," post_content ")]')[0]
        plain = text(body)
        names = SBI_NAMES if sbi else MC_NAMES
        docids = doc_ids(record['title'], names)
        if not docids: docids = doc_ids(plain, names)
        if not sbi and '取引利用規約・取引説明書' in record['title']: docids = list(dict.fromkeys([*docids, 'mercoin_tos', 'mercoin_es']))
        if sbi and record['publishedDate'] < '2022-01-01': docids = []
        # Explicit effective-date section outranks the notice date and WordPress
        # modification date. Never infer a historical version from a live URL.
        effective = None
        flattened = ' '.join(unicodedata.normalize('NFKC', plain).split())
        date_expression = r'(20\d{2}\s*年\s*\d+\s*月\s*\d+\s*日)'
        weekday = r'(?:\s*[（(][^）)]{1,3}[）)])?'
        if sbi:
            at = re.search(r'■\s*施行日', plain)
            found = dates(plain[at.end():at.end()+180]) if at else []
            if not found:
                found = re.findall(date_expression + weekday + r'\s*(?:付(?:け)?で|より)(?![^。]{0,10}お知らせ)', flattened)
                found = dates(found[0]) if found else []
            effective = found[0] if found else None
        else:
            found = re.findall(date_expression + weekday + r'\s*付(?:け)?で', flattened)
            effective = dates(found[0])[0] if found else None
        event = {**{key: record[key] for key in ['id', 'provider', 'title', 'publishedDate', 'url']},
                 'effectiveDate': effective, 'effectiveDateBasis': 'announcement-body' if effective else 'not-confirmed',
                 'docIds': docids, 'lineage': 'legacy-vctrade' if sbi and record['publishedDate'] < '2022-01-01' else 'current-service',
                 'source': BASE + record['original'], 'sourceSha256': record['originalSha256'],
                 'announcementText': plain.strip(), 'segments': [], 'evidence': [], 'unresolvedPages': []}
        if not sbi:
            posted = tree.xpath('//time[contains(@class, "c-postTimes__posted")]/@datetime')
            modified = tree.xpath('//time[contains(@class, "c-postTimes__modified")]/@datetime')
            if posted: event['publishedDate'] = posted[0][:10]
            event['sourceModifiedDate'] = modified[0][:10] if modified else None
        for attachment in record['attachments']:
            if 'file' not in attachment:
                event['evidence'].append({**attachment, 'available': False}); continue
            data = (ARCHIVE / 'sources' / attachment['file']).read_bytes()
            assert hashlib.sha256(data).hexdigest() == attachment['sha256']
            source = {**attachment, 'localUrl': BASE + attachment['file'], 'available': True,
                      'docIds': pdf_doc_ids(attachment['url'], attachment['label']) if attachment['kind'] == 'comparison-pdf' else docids}
            if event['lineage'] == 'legacy-vctrade': source['docIds'] = []
            event['docIds'] = list(dict.fromkeys([*event['docIds'], *source['docIds']]))
            if source['kind'] == 'comparison-pdf':
                try:
                    segments, unresolved = pdf_segments(source, event)
                    event['segments'].extend(segments)
                    event['unresolvedPages'].extend([{'file': source['file'], 'page': page} for page in unresolved])
                except Exception as error:
                    source['extractionError'] = str(error)
            event['evidence'].append(source)
        if not sbi: event['segments'].extend(mercoin_segments(body, event))
        event['coverage'] = 'comparison-excerpts' if event['segments'] else 'comparison-images' if any(source['kind'] == 'comparison-image' for source in event['evidence']) else 'announcement-only'
        # Date headings can describe multiple scheduled effective dates.
        heading_dates = list(dict.fromkeys(date for heading in body.xpath('.//h2|.//h3|.//h4') if '改定' in heading.text_content() for date in dates(heading.text_content())))
        event['scheduledEffectiveDates'] = heading_dates
        events.append(event)
        extraction.append({'id': event['id'], 'provider': event['provider'], 'publishedDate': event['publishedDate'], 'effectiveDate': effective,
                           'docIds': event['docIds'], 'segments': len(event['segments']), 'coverage': event['coverage'], 'unresolvedPages': event['unresolvedPages']})
    events.sort(key=lambda event: (event['effectiveDate'] or event['publishedDate'], event['id']), reverse=True)
    payload = {'checkedAt': manifest['checkedAt'], 'coverageNote': '公式の公開一覧から発見できた改定告知・新旧対照表を収録しています。変更箇所の抜粋であり、各時点の全文や全改定の連続性を保証するものではありません。', 'events': events}
    (ROOT / 'features/provider-history-data.json').write_text(json.dumps(payload, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    (ARCHIVE / 'import-report.json').write_text(json.dumps({'events': extraction, 'coverage': dict(Counter(event['coverage'] for event in events))}, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(json.dumps({'events': len(events), 'segments': sum(len(event['segments']) for event in events), 'coverage': dict(Counter(event['coverage'] for event in events)), 'unresolvedPages': sum(len(event['unresolvedPages']) for event in events)}, ensure_ascii=False))


if __name__ == '__main__': main()
