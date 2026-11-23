// Shared, framework-independent model for topic research and source relationships.
import { classifyServices, matchesService } from "./services-48285ee69786.js";
export const TOPICS = [
  { id: 'custody', name: '顧客資産の保護・分別管理', summary: '預り資産の管理、信託、秘密鍵、返還方法を調べる。', terms: ['分別管理', '利用者財産', '顧客資産', '信託', '秘密鍵', 'コールドウォレット'] },
  { id: 'compensation', name: '不正利用・補償・免責', summary: '不正アクセス時の補償条件や損害賠償、免責の範囲を比べる。', terms: ['補償', '不正利用', '不正アクセス', '免責', '損害賠償', '責任を負'] },
  { id: 'aml', name: '本人確認・マネロン対策', summary: '取引時確認、疑わしい取引、トラベルルールをたどる。', terms: ['本人確認', '取引時確認', '疑わしい取引', 'トラベルルール', 'マネー・ローンダリング', 'マネーロンダリング', 'マネロン', 'テロ資金供与'] },
  { id: 'privacy', name: '個人情報・外部提供', summary: '取得・利用目的、共同利用、委託、第三者への提供を確認する。', terms: ['個人情報', '個人データ', '共同利用', '第三者提供', '個人番号', '利用目的'] },
  { id: 'security', name: 'システム・セキュリティ', summary: 'システム障害、サイバー対策、委託先管理を調べる。', terms: ['システムリスク', 'システム障害', '情報セキュリティ', 'サイバー', '委託先', '事業継続'] },
  { id: 'trading', name: '注文・価格・手数料', summary: '注文の成立、価格決定、スプレッド、費用を比較する。', terms: ['手数料', 'スプレッド', '最良執行', '約定', '注文の取消', '取引価格', '価格優先'] },
  { id: 'termination', name: '利用制限・解約・返還', summary: '取引や口座の停止、契約終了、資産の返還条件を確認する。', terms: ['解約', '口座の停止', '口座閉鎖', '利用制限', '契約の終了', '返還', '出金'] },
  { id: 'lending', name: '貸借・ステーキング', summary: '貸付条件、報酬、中途解約、貸借に固有のリスクを調べる。', terms: ['貸借', '貸コイン', 'レンディング', 'ステーキング', '消費貸借', '中途解約'] },
  { id: 'complaints', name: '苦情処理・紛争解決', summary: '相談窓口、外部機関、裁判管轄、苦情の処理方法を比べる。', terms: ['苦情', '紛争解決', '相談窓口', 'FINMAC', '合意管轄', '裁判管轄', 'カスタマーハラスメント'] },
  { id: 'disclosure', name: '説明・勧誘・利益相反', summary: 'リスク説明、勧誘、情報提供、利益相反の管理を確認する。', terms: ['利益相反', '勧誘', '契約締結前', '情報提供', '説明義務', '適合性', '顧客中心'] },
];

export const KINDS = [
  { id: 'law', name: '法令' }, { id: 'guideline', name: '監督指針・ガイドライン' },
  { id: 'jvcea', name: '協会の自主規制規則' }, { id: 'company', name: '事業者の公表資料' },
  { id: 'reference', name: 'Q&A・その他' },
];
export const MAPPING_KEY = 'researchMappings';
export const normalize = text => String(text || '').normalize('NFKC').toLowerCase().replace(/[\s・･－―‐–—-]+/g, '');
export const isRegulation = row => ['law', 'guideline', 'jvcea'].includes(row.kind);
export const rowKey = row => `${row.docId}/${row.item.id}`;

// For change detection only; not a cryptographic integrity signature.
export function fingerprint(text) {
  let hash = 2166136261;
  for (const char of String(text || '')) hash = Math.imul(hash ^ char.codePointAt(0), 16777619);
  return (hash >>> 0).toString(16);
}

export function buildCatalog(documents, toText) {
  const rows = [], providers = new Set();
  const topicTerms = TOPICS.map(topic => [topic.id, topic.terms.map(term => [term, normalize(term)])]);
  for (const [docId, doc] of Object.entries(documents || {})) {
    if (!doc || typeof doc !== 'object' || Array.isArray(doc) || !doc.displayName) continue;
    const kind = doc.company ? 'company' : doc.law ? 'law' : doc.jvcea ? 'jvcea' : doc.compareGroup ? 'guideline' : 'reference';
    const provider = doc.company?.name || '';
    if (provider) providers.add(provider);
    let trail = '';
    for (const item of (doc.public_comment ? doc.questions : doc.tweets) || []) {
      if (!item?.id || item.deleted) continue;
      const content = doc.public_comment ? `【質問】${item.question || ''}<br>【回答】${item.answer || ''}` : item.content;
      if (!content) { if (item.index) trail = toText(item.index); continue; }
      const text = toText(content).replace(/原本PDF（[^）]+）/g, '').trim();
      const body = normalize(text), heading = normalize(`${trail} ${item.index || ''}`);
      // Titles help find a relevant document, but do not classify every paragraph
      // under a document title as if it addressed that topic.
      const topics = {};
      for (const [topicId, terms] of topicTerms) {
        const matches = terms.filter(([, term]) => body.includes(term) || heading.includes(term));
        if (matches.length) topics[topicId] = {
          terms: matches.map(([term]) => term),
          score: matches.reduce((score, [, term]) => score + 1 + (heading.includes(term) ? 3 : 0), 0),
        };
      }
      rows.push({ docId, doc, item, content, text, body, heading, trail, kind, provider, topics,
        services: classifyServices(docId, doc, `${trail} ${item.index || ''}`, text) });
    }
  }
  return { rows, providers: [...providers].sort((a, b) => a.localeCompare(b, 'ja')), byKey: new Map(rows.map(row => [rowKey(row), row])) };
}

export function topicRows(catalog, topicId, { kind = '', provider = '', query = '', docId = '', service = '', includeCommon = true } = {}) {
  const words = query.trim().split(/\s+/).filter(Boolean).map(normalize);
  return catalog.rows.filter(row => row.topics[topicId] && (!kind || row.kind === kind) &&
    (!provider || row.provider === provider) && (!docId || row.docId === docId) && matchesService(row, service, includeCommon) &&
    words.every(word => (row.body + row.heading + normalize(row.doc.displayName)).includes(word)))
    .sort((a, b) => b.topics[topicId].score - a.topics[topicId].score || rowKey(a).localeCompare(rowKey(b), 'ja'));
}

export function excerpt(row, topicId, length = 180) {
  const terms = row.topics[topicId]?.terms || [];
  const positions = terms.map(term => row.text.indexOf(term)).filter(at => at >= 0);
  const at = positions.length ? Math.max(0, Math.min(...positions) - 35) : 0;
  const text = row.text.slice(at, at + length).replace(/\s+/g, ' ');
  return (at ? '…' : '') + text + (at + length < row.text.length ? '…' : '');
}

function bigrams(text) {
  const grams = new Set();
  for (let i = 0; i < text.length - 1; i++) grams.add(text.slice(i, i + 2));
  return grams;
}

export function rankCompanyCandidates(catalog, rule, topicId, provider, limit = 8, serviceOptions = {}) {
  if (!rule) return [];
  const sourceTerms = new Set(rule.topics[topicId]?.terms || []);
  const sourceGrams = bigrams(rule.body.slice(0, 6000));
  return topicRows(catalog, topicId, { kind: 'company', provider, ...serviceOptions }).map(row => {
    const shared = row.topics[topicId].terms.filter(term => sourceTerms.has(term));
    const grams = bigrams(row.body.slice(0, 6000));
    let intersection = 0;
    for (const gram of grams) if (sourceGrams.has(gram)) intersection++;
    const similarity = 2 * intersection / Math.max(1, sourceGrams.size + grams.size);
    return { row, shared, score: shared.length * 2 + similarity + row.topics[topicId].score / 100 };
  }).filter(candidate => candidate.shared.length)
    .sort((a, b) => b.score - a.score || rowKey(a.row).localeCompare(rowKey(b.row), 'ja')).slice(0, limit);
}

export function mappingId(topicId, rule, company) {
  return `research:${[topicId, rowKey(rule), rowKey(company)].map(encodeURIComponent).join(':')}`;
}

export function createMapping(topicId, rule, company, note = '', now = new Date().toISOString()) {
  if (!TOPICS.some(topic => topic.id === topicId) || !isRegulation(rule) || company?.kind !== 'company') {
    throw new Error('規制の条文と事業者の資料を選んでください。');
  }
  return {
    id: mappingId(topicId, rule, company), topicId,
    regulation: { docId: rule.docId, itemId: rule.item.id },
    company: { docId: company.docId, itemId: company.item.id },
    fingerprints: { regulation: fingerprint(rule.content), company: fingerprint(company.content) },
    note: String(note).trim(), updatedAt: now, confirmedAt: now, deleted: false,
  };
}

export function resolveMapping(record, catalog) {
  const rule = catalog.byKey.get(`${record.regulation?.docId}/${record.regulation?.itemId}`);
  const company = catalog.byKey.get(`${record.company?.docId}/${record.company?.itemId}`);
  const missing = !rule || !company;
  const changed = !missing && (record.fingerprints?.regulation !== fingerprint(rule.content) || record.fingerprints?.company !== fingerprint(company.content));
  return { record, rule, company, state: missing ? 'missing' : changed ? 'changed' : 'confirmed' };
}

export function upsertMapping(documents, record) {
  const records = Array.isArray(documents[MAPPING_KEY]) ? [...documents[MAPPING_KEY]] : [];
  const at = records.findIndex(item => item.id === record.id);
  if (at < 0) records.push(record); else records[at] = record;
  documents[MAPPING_KEY] = records;
  return records;
}
