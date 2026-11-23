import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import vm from 'node:vm';
import {
  TOPICS, buildCatalog, topicRows, rowKey, rankCompanyCandidates,
  createMapping, resolveMapping, upsertMapping, MAPPING_KEY,
} from '../features/research-model.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const html = readFileSync(resolve(root, 'index.html'), 'utf8');
const code = readFileSync(resolve(root, 'assets', html.match(/src="\/assets\/(index-[^"/]+\.js)"/)[1]), 'utf8');
const dataAsset = code.match(/import sbivcDocuments from "\.\/([^"/]+)"/)[1];
const { default: sbivcDocuments } = await import(pathToFileURL(resolve(root, 'assets', dataAsset)));

// Read the real deployed data literal without executing the application or DOM.
const start = code.indexOf('Rd={') + 3;
let end, depth = 0, quote = null;
for (let i = start; i < code.length; i++) {
  const char = code[i];
  if (quote) { if (char === '\\') i++; else if (char === quote) quote = null; }
  else if ('"\'`'.includes(char)) quote = char;
  else if (char === '{') depth++;
  else if (char === '}' && --depth === 0) { end = i + 1; break; }
}
assert(end);
const documents = JSON.parse(JSON.stringify(vm.runInNewContext(`(${code.slice(start, end)})`, { sbivcDocuments })));
const toText = text => String(text || '').replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, '');
const catalog = buildCatalog(documents, toText);
assert.equal(TOPICS.length, 10);
assert.deepEqual(catalog.providers, ['SBI VCトレード', 'メルコイン']);
for (const topic of TOPICS) {
  const rows = topicRows(catalog, topic.id);
  assert(rows.some(row => ['law', 'guideline', 'jvcea'].includes(row.kind)), topic.id);
  assert(rows.some(row => row.provider === 'SBI VCトレード'), topic.id);
  assert(rows.some(row => row.provider === 'メルコイン'), topic.id);
  const filtered = topicRows(catalog, topic.id, { kind: 'company', provider: 'メルコイン' });
  assert(filtered.every(row => row.provider === 'メルコイン' && row.kind === 'company'));
}
assert.equal(topicRows(catalog, 'not-a-topic').length, 0);
assert.equal(topicRows(catalog, 'custody', { query: '絶対に一致しないテスト文字列' }).length, 0);
assert(!catalog.rows.some(row => row.item.deleted));

const rule = catalog.byKey.get('payment_services_act/tiMyIMVIoB2Dk5Ku');
const company = catalog.byKey.get('sbivc-service-terms/sbivc-service-terms-a7');
const candidates = rankCompanyCandidates(catalog, rule, 'custody', 'SBI VCトレード');
assert(candidates.some(candidate => rowKey(candidate.row) === rowKey(company)));
assert(candidates.every(candidate => candidate.shared.length && candidate.row.provider === 'SBI VCトレード'));
const record = createMapping('custody', rule, company, '分別管理の記載を確認', '2026-11-20T16:00:00.000Z');
assert.equal(resolveMapping(record, catalog).state, 'confirmed');
assert.throws(() => createMapping('custody', company, rule), /規制の条文/);
assert.throws(() => createMapping('invalid', rule, company), /規制の条文/);

const changedDocuments = structuredClone(documents);
changedDocuments[company.docId].tweets.find(item => item.id === company.item.id).content += '<br>改定後の記載';
assert.equal(resolveMapping(record, buildCatalog(changedDocuments, toText)).state, 'changed');
const missingDocuments = structuredClone(documents);
delete missingDocuments[company.docId];
assert.equal(resolveMapping(record, buildCatalog(missingDocuments, toText)).state, 'missing');
upsertMapping(documents, record);
upsertMapping(documents, { ...record, note: '更新したメモ' });
assert.equal(documents[MAPPING_KEY].length, 1);
assert.equal(documents[MAPPING_KEY][0].note, '更新したメモ');

// Exercise the actual deployed backup exporter/importer, including older files,
// newer-note preference and deletion tombstones across export/import cycles.
const backupCode = code.slice(code.indexOf('var ch=`legal-documents-user-data`'), code.indexOf('function mh('));
assert(backupCode.startsWith('var ch='));
let target = structuredClone(documents);
delete target[MAPPING_KEY];
const backupContext = vm.createContext({
  nh: 'regulations', rl: () => ({}), il: () => {},
  md: docs => Object.entries(docs).filter(([, doc]) => doc && typeof doc === 'object' && !Array.isArray(doc)),
  hd: (docs, id) => docs[id], nl: callback => callback(target),
});
vm.runInContext(backupCode, backupContext);
const exported = JSON.parse(JSON.stringify(backupContext.dh(documents, {})));
assert.equal(exported.version, 4);
assert.equal(exported.researchMappings.length, 1);
assert.equal(backupContext.fh(exported, target).counts.researchMappings, 1);
backupContext.ph(exported);
assert.equal(target[MAPPING_KEY][0].note, '更新したメモ');
const newer = { ...record, note: 'より新しいメモ', updatedAt: '2026-11-21T01:00:00.000Z' };
upsertMapping(target, newer);
backupContext.ph(exported);
assert.equal(target[MAPPING_KEY][0].note, 'より新しいメモ');
const removed = { ...newer, deleted: true, updatedAt: '2026-11-21T02:00:00.000Z' };
upsertMapping(target, removed);
const deletionExport = backupContext.dh(target, {});
assert.equal(backupContext.fh(deletionExport, target).counts.researchMappings, 0);
backupContext.ph(exported);
assert.equal(target[MAPPING_KEY][0].deleted, true, 'Older backup must not resurrect removed relationships');
assert(backupContext.fh({ ...exported, version: 1, researchMappings: undefined }, target).ok);
assert(!backupContext.fh({ ...exported, version: 5 }, target).ok);

// Ensure bundled-data upgrades preserve relationships and their deletion state.
const mergeCode = code.slice(code.indexOf('var pm='), code.indexOf('var Em=', code.indexOf('var pm=')));
const mergeContext = vm.createContext({ X: 'legal-documents-data', Gc: 'legal-documents-base', Kc: 'legal-documents-version' });
vm.runInContext(mergeCode, mergeContext);
const base = structuredClone(documents); delete base[MAPPING_KEY];
const stored = structuredClone(base); stored[MAPPING_KEY] = [removed];
const store = new Map([['legal-documents-data', JSON.stringify(stored)], ['legal-documents-base', JSON.stringify(base)]]);
const incoming = structuredClone(base); incoming[company.docId].description += ' 更新';
mergeContext.Sm(incoming, { getItem: key => store.get(key) ?? null, setItem: (key, value) => store.set(key, value) });
assert.equal(JSON.parse(store.get('legal-documents-data'))[MAPPING_KEY][0].deleted, true);

// The delivered modules and styles referenced by the application must exist.
const viewAsset = code.match(/import \{ createResearchViews \} from "\.\/([^"/]+)"/)[1];
const viewCode = readFileSync(resolve(root, 'assets', viewAsset), 'utf8');
const modelAsset = viewCode.match(/\.\/(research-model-[a-f0-9]+\.js)/)[1];
assert.equal(readFileSync(resolve(root, 'assets', modelAsset), 'utf8').replace(/"\.\/services-[a-f0-9]+\.js"/, "'./services.mjs'"), readFileSync(resolve(root, 'features/research-model.mjs'), 'utf8'));
assert(html.includes('/assets/research-'));
for (const path of ['/topics', '/topics/:topicId', '/provider-compare', '/regulation-map']) assert(code.includes(`path:\`${path}\``));
console.log(`PASS: ${TOPICS.length} topics across ${catalog.rows.length} source items; both providers; source-based suggestions; confirmation/change/missing states; backup v1/v2/v3/v4, newer-note merge and tombstones; existing-data upgrades; deployable routes and modules.`);
export { documents, catalog, toText, code, backupContext, target };
