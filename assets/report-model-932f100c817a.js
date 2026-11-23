import { fingerprint, rowKey } from "./research-model-78e455728e09.js";
export const REPORT_KEY = 'researchReport';
export const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
export function sourceSnapshot(row, toText) {
  return { label: `${toText(row.doc.displayName)} ／ ${row.item.index || '本文'}`, docId: row.docId, itemId: row.item.id,
    url: row.doc.url || '', localUrl: row.doc.source?.localUrl || '', pages: row.item.sourcePages || [],
    fetchedAt: row.doc.company?.fetchedAt || row.doc.source?.fetchedAt || '', fingerprint: fingerprint(row.content) };
}
export function rowsReport(kind, title, rows, toText) {
  return { id: `${kind}:${rows.map(rowKey).join('|')}`, kind, title, blocks: rows.map(row => ({ label: toText(row.doc.displayName), text: row.text, source: sourceSnapshot(row, toText) })) };
}
export function eventReport(event, { segment, impact, review, toText = value => String(value || ''), checkedAt = '' } = {}) {
  const blocks = [], kind = impact ? 'impact' : 'history';
  if (segment) for (const side of ['before', 'after']) blocks.push({ label: side === 'before' ? '改定前' : '改定後', text: segment[side + 'Known'] ? toText(segment[side]) || '（原本の欄は空欄）' : 'この側の本文は未取得', source: { label: segment.label, url: segment.sourceUrl || event.url, localUrl: segment.source, fetchedAt: checkedAt, fingerprint: event.sourceFingerprint } });
  if (!segment) blocks.push({ label: event.kind === 'company' ? '告知本文' : '改正の内容', text: event.announcementText || event.text, source: { label: event.title, url: event.url || '', appUrl: event.href || '', localUrl: event.source || '', fetchedAt: checkedAt, fingerprint: event.sourceFingerprint } });
  if (event.kind === 'company') for (const source of event.evidence || []) blocks.push({ label: '告知の添付原本', text: source.label || source.kind, source: { label: source.label, url: source.url, localUrl: source.localUrl || '', fetchedAt: checkedAt, fingerprint: event.sourceFingerprint } });
  if (impact) {
    blocks.push({ label: '関連記録の確認範囲', text: `${impact.basis}\n対応づけ ${impact.mappings.length}件、条文の確認記録 ${impact.checklist.length}件、社内規程 ${impact.internalRegulations.length}件。\n関連記録がないことは、影響がないことを意味しません。` });
    for (const entry of impact.mappings) blocks.push({ label: '対応づけの根拠メモ', text: entry.record.note || '未記録' });
    for (const entry of impact.checklist) blocks.push({ label: '条文の確認記録', text: `${toText(entry.doc.displayName)} ／ ${entry.row?.item.index || entry.itemId}\n状況 ${entry.record.status || '未設定'} ／ 担当 ${entry.record.owner || '未設定'}\n${entry.record.note || ''}\n${entry.record.evidence || ''}` });
    for (const entry of impact.internalRegulations) blocks.push({ label: '関連する社内規程', text: `${entry.name || entry.id}\n${entry.url || ''}` });
    if (event.nativeImpact) blocks.push({ label: '既存の改正への社内対応', text: [['status', '状況'], ['owner', '担当'], ['due', '期限'], ['areas', '業務'], ['reason', '判断理由'], ['note', 'メモ'], ['evidence', '根拠']].filter(([key]) => event.nativeImpact[key]).map(([key, label]) => `${label} ${event.nativeImpact[key]}`).join('\n') });
    if (review && !review.deleted) blocks.push({ label: '保存済みの改正確認記録', text: `状況 ${({ reviewing: '確認中', done: '確認完了', 'not-applicable': '対象外と判断' })[review.status] || '未確認'} ／ 担当 ${review.owner || '未設定'} ／ 期限 ${review.dueDate || '未設定'}\n${review.note || ''}\n保存 ${review.updatedAt}` });
  }
  return { id: `event:${event.eventKey}:${kind}:${segment?.id || (kind === 'impact' ? 'impact' : 'announcement')}`, kind, title: event.title || event.docNames.join('・'),
    caveat: event.kind === 'company' ? '公式告知・新旧対照表の収録範囲です。過去の全文や全改定の連続性は保証していません。' : '収録済みの改正履歴と関連記録です。',
    dates: `施行 ${event.effectiveDate || '未確認'} ／ 告知 ${event.publishedDate || '未確認'}`, blocks };
}
export function upsertReport(documents, entry, now = new Date().toISOString()) {
  if (!entry?.id) throw new Error('レポートの項目が不正です。');
  const records = Array.isArray(documents[REPORT_KEY]) ? [...documents[REPORT_KEY]] : [];
  const index = records.findIndex(value => value.id === entry.id), old = records[index];
  const value = { ...entry, note: entry.note ?? old?.note ?? '', order: entry.order ?? old?.order ?? records.reduce((max, value) => Math.max(max, value.order || 0), 0) + 1, updatedAt: now, capturedAt: entry.capturedAt || now, deleted: !!entry.deleted };
  if (index < 0) records.push(value); else records[index] = value;
  documents[REPORT_KEY] = records; return records;
}
export function reportState(entry, catalog, events = []) {
  const sourceStates = (entry.blocks || []).filter(block => block.source).map(({ source }) => {
    if (source.docId) {
      const row = catalog.byKey.get(`${source.docId}/${source.itemId}`);
      return !row ? 'missing' : fingerprint(row.content) !== source.fingerprint ? 'changed' : 'saved';
    }
    if (entry.id.startsWith('event:')) {
      const event = events.find(value => entry.id.startsWith(`event:${value.eventKey}:`));
      return !event ? 'missing' : event.sourceFingerprint !== source.fingerprint ? 'changed' : 'saved';
    }
    return 'saved';
  });
  return sourceStates.includes('missing') ? 'missing' : sourceStates.includes('changed') ? 'changed' : 'saved';
}
export function reportEntries(records) { return (records || []).filter(value => !value.deleted && value.kind !== 'settings').sort((a, b) => (a.order || 0) - (b.order || 0) || a.id.localeCompare(b.id)); }
export function safeUrl(value, base) {
  if (!value) return '';
  try { const url = new URL(value, base); return ['https:', 'http:'].includes(url.protocol) ? url.href : ''; } catch { return ''; }
}
function sourceLines(source, base) {
  if (!source) return [];
  return [source.label || '', source.fetchedAt ? `資料取得日 ${source.fetchedAt}` : '資料取得日 未記録', source.pages?.length ? `原本ページ ${source.pages.join('・')}` : '',
    source.url && `公式原文 ${safeUrl(source.url, base)}`, source.localUrl && `保存原本 ${safeUrl(source.localUrl, base)}`, source.docId ? `収録条文 ${safeUrl(`/document/${source.docId}/${source.itemId}`, base)}` : source.appUrl ? `収録改正 ${safeUrl(source.appUrl, base)}` : ''].filter(Boolean);
}
export function reportMarkdown(entries, metadata = {}, base = 'https://yamatoya.github.io', now = new Date().toISOString()) {
  return [`# ${metadata.title || '調査レポート'}`, `作成 ${now}${metadata.author ? '\n作成者 ' + metadata.author : ''}`, metadata.summary || '', '引用資料と利用者の判断メモを収録しています。適用・適合性の自動判定ではありません。', ...entries.map((entry, i) => [`## ${i + 1}. ${entry.title}`, entry.dates || '', `収録スナップショット ${entry.capturedAt}`, entry.caveat || '', ...(entry.blocks || []).map(block => [`### ${block.label}`, block.text || '', ...sourceLines(block.source, base)].join('\n\n')), `### 判断メモ\n\n${entry.note || '未記録'}`].join('\n\n'))].join('\n\n') + '\n';
}
export function reportHtml(entries, metadata = {}, base, now = new Date().toISOString()) {
  const e = escapeHtml;
  return `<!doctype html><html lang="ja"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${e(metadata.title || '調査レポート')}</title><style>body{font:15px/1.8 system-ui,sans-serif;max-width:1050px;margin:40px auto;padding:0 24px;color:#17202e}h1,h2,h3{line-height:1.5}section{border-top:1px solid #bbc4d0;margin-top:28px;padding-top:12px}pre{font:inherit;white-space:pre-wrap;overflow-wrap:anywhere}.sources{font-size:12px;color:#475266}a{overflow-wrap:anywhere}article{break-inside:auto}h2,h3{break-after:avoid}@media print{body{margin:0;padding:0}a{color:inherit}@page{margin:18mm}}</style><h1>${e(metadata.title || '調査レポート')}</h1><p>作成 ${e(now)} ／ 作成者 ${e(metadata.author || '未設定')}</p><pre>${e(metadata.summary || '')}</pre><p>引用資料と利用者の判断メモを収録しています。適用・適合性の自動判定ではありません。</p>${entries.map((entry, i) => `<section><h2>${i + 1}. ${e(entry.title)}</h2><p>${e(entry.dates || '')}</p><p>収録スナップショット ${e(entry.capturedAt)}</p><p>${e(entry.caveat || '')}</p>${(entry.blocks || []).map(block => `<article><h3>${e(block.label)}</h3><pre>${e(block.text)}</pre>${block.source ? `<div class="sources">${sourceLines(block.source, base).map(line => { const at = line.search(/https?:\/\//); return `<p>${at < 0 ? e(line) : e(line.slice(0, at)) + '<a href="' + e(line.slice(at)) + '">' + e(line.slice(at)) + '</a>'}</p>`; }).join('')}</div>` : ''}</article>`).join('')}<h3>判断メモ</h3><pre>${e(entry.note || '未記録')}</pre></section>`).join('')}</html>`;
}
