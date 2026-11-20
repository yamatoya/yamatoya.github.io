// Regression checks against the actual deployed registry, merge and search code.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';
import vm from 'node:vm';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const report = JSON.parse(readFileSync(resolve(root, 'docs/sbivc/2026-11-21/import-report.json'), 'utf8'));
const { default: added } = await import(pathToFileURL(resolve(root, 'assets', report.asset)));
const html = readFileSync(resolve(root, 'index.html'), 'utf8');
const entry = html.match(/src="\/assets\/(index-[^"/]+\.js)"/)[1];
const code = readFileSync(resolve(root, 'assets', entry), 'utf8');
assert.equal(Object.keys(added).length, 31);
assert(code.includes(`import sbivcDocuments from "./${report.asset}"`));

// Find the end of the literal registry, ignoring the embedded JSON strings.
const start = code.indexOf('Rd={') + 3;
assert(start > 3);
let end, depth = 0, quote = null;
for (let i = start; i < code.length; i++) {
  const char = code[i];
  if (quote) {
    if (char === '\\') i++;
    else if (char === quote) quote = null;
  } else if ('"\'`'.includes(char)) quote = char;
  else if (char === '{') depth++;
  else if (char === '}' && --depth === 0) { end = i + 1; break; }
}
assert(end, 'Document registry boundary');
const registry = vm.runInNewContext(`(${code.slice(start, end)})`, { sbivcDocuments: added });
assert(registry.mercoin_tos && registry.crypto_guidelines, 'Existing documents retained');
for (const [id, doc] of Object.entries(added)) {
  assert.equal(registry[id], doc);
  assert.equal(doc.company.name, 'SBI VCトレード');
  assert.equal(doc.company.fetchedAt, '2026-11-21');
  assert.equal(doc.accountId, id);
  const pdf = readFileSync(resolve(root, '.' + doc.source.localUrl));
  assert.equal(createHash('sha256').update(pdf).digest('hex'), doc.source.sha256);
  assert.equal(new Set(doc.tweets.map(item => item.id)).size, doc.tweets.length);
  for (const item of doc.tweets) {
    assert(item.index && item.content && !item.content.includes('\ufffd'));
    assert(item.sourcePages[0] >= 1 && item.sourcePages[1] <= doc.source.pages);
    assert(item.content.includes(`${doc.source.localUrl}#page=${item.sourcePages[0]}`));
  }
}
const terms = added['sbivc-service-terms'];
assert.match(terms.tweets.find(item => item.id.endsWith('-a1')).index, /本約款の趣旨/);
assert(terms.tweets.some(item => item.id.endsWith('-a13-2')));
assert(terms.tweets.some(item => item.id.endsWith('-a46')));
assert(terms.tweets.some(item => item.id.endsWith('-appendix')));

// Exercise the deployed three-way merge with existing browser edits and records.
const mergeStart = code.indexOf('var pm=');
const mergeEnd = code.indexOf('var Em=', mergeStart);
assert(mergeStart > 0 && mergeEnd > mergeStart);
const context = vm.createContext({ X: 'legal-documents-data', Gc: 'legal-documents-base', Kc: 'legal-documents-version' });
vm.runInContext(code.slice(mergeStart, mergeEnd), context);
const existing = structuredClone(registry);
for (const id of Object.keys(added)) delete existing[id];
const edited = structuredClone(existing);
edited.mercoin_tos.tweets[0].content += '<br>保存済みの独自編集';
edited.mercoin_tos.checklist = { [edited.mercoin_tos.tweets[0].id]: { status: '一部', owner: '確認担当' } };
edited['custom-document'] = { displayName: '利用者が追加した文書', tweets: [{ id: 'custom-1', index: '第1条', content: '保持する本文' }] };
const storage = new Map([
  ['legal-documents-data', JSON.stringify(edited)],
  ['legal-documents-base', JSON.stringify(existing)],
  ['legal-documents-version', 'previous-version'],
]);
const backend = { getItem: key => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value) };
const mergedResult = context.Sm(registry, backend);
assert.equal(mergedResult.status, 'merged');
assert.equal(mergedResult.conflicts.length, 0);
const merged = JSON.parse(storage.get('legal-documents-data'));
assert(merged.mercoin_tos.tweets[0].content.endsWith('保存済みの独自編集'));
assert.equal(merged.mercoin_tos.checklist[edited.mercoin_tos.tweets[0].id].owner, '確認担当');
assert(merged['custom-document']);
assert.equal(Object.keys(merged).filter(id => id.startsWith('sbivc-')).length, 31);
assert.equal(context.Sm(registry, backend).status, 'unchanged');

// Run the real search worker, including its document-kind filtering.
const workerFile = code.match(/new URL\(`\/assets\/([^`]+\.js)`/)[1];
let result;
const self = { postMessage: value => { result = value.result; } };
vm.runInNewContext(readFileSync(resolve(root, 'assets', workerFile), 'utf8'), { self });
self.onmessage({ data: { type: 'init', documentsText: JSON.stringify(merged) } });
for (const [query, docId] of [['本約款の趣旨', 'sbivc-service-terms'], ['分別管理の対象外', 'sbivc-lending-manual'], ['第三者が権限なく', 'sbivc-payment-compensation'], ['ビットコイン', 'sbivc-asset-overview']]) {
  self.onmessage({ data: { type: 'search', id: query, query, options: { filters: { docs: [docId], kinds: ['tweet'] } } } });
  assert(result.total > 0, `${query} should find ${docId}`);
  assert.deepEqual(Object.keys(result.byDoc), [docId]);
}
console.log('PASS: 31 PDFs and registry entries; article boundaries and source links; existing edits/records survive upgrade; search worker finds terms, lending risks, compensation and asset pages.');
