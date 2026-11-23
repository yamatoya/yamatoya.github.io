import { fingerprint, rowKey, isRegulation } from "./research-model-78e455728e09.js";
import { classifyServices, matchesService } from "./services-48285ee69786.js";

export const IMPACT_REVIEW_KEY = 'researchImpactReviews';
export const REVIEW_STATES = [
  { id: '', name: '未確認' }, { id: 'reviewing', name: '確認中' },
  { id: 'done', name: '確認完了' }, { id: 'not-applicable', name: '対象外と判断' },
];
export const eventDate = event => event.effectiveDate || event.publishedDate || '';

export function providerEvents(data, documents, toText) {
  return (data.events || []).map(event => {
    const docIds = event.docIds.filter(id => documents[id]?.company?.name === event.provider);
    const names = docIds.map(id => toText(documents[id].displayName));
    const text = [event.title, event.announcementText, ...event.segments.map(segment => toText(segment.before + ' ' + segment.after))].join(' ');
    const serviceIds = new Set();
    for (const id of docIds) for (const service of classifyServices(id, documents[id], event.title, text).ids) serviceIds.add(service);
    if (!serviceIds.size) for (const id of classifyServices('', { displayName: event.title, company: {} }, event.title, text).ids) serviceIds.add(id);
    return { ...event, kind: 'company', docIds, docNames: names, text,
      services: { ids: [...serviceIds], basis: '告知と対象文書の分類' },
      eventKey: 'provider:' + event.id,
      sourceFingerprint: fingerprint(JSON.stringify([event.effectiveDate, event.docIds, event.sourceSha256, event.segments, event.evidence.map(source => source.sha256)])),
    };
  });
}

export function regulatoryEvents(documents, catalog, toText) {
  const events = [];
  for (const [docId, doc] of Object.entries(documents)) {
    if (!doc || Array.isArray(doc) || !(doc.law || doc.jvcea || doc.compareGroup) || doc.company || doc.public_comment) continue;
    for (const revision of doc.revisions || []) {
      if (revision.kind === '照合') continue;
      const changes = (revision.articles || []).filter(change => change.tweetId && change.before !== change.after);
      if (!changes.length) continue;
      const text = [revision.title, ...changes.map(change => toText((change.before || '') + ' ' + (change.after || '')))].join(' ');
      const services = new Set();
      for (const change of changes) {
        const row = catalog.byKey.get(`${docId}/${change.tweetId}`);
        for (const id of (row?.services || classifyServices(docId, doc, revision.title, text)).ids) services.add(id);
      }
      events.push({ id: `${docId}/${revision.id}`, eventKey: `regulation:${docId}/${revision.id}`, kind: 'regulation', provider: '',
        title: revision.title, effectiveDate: revision.effectiveDate || revision.date || null, publishedDate: revision.publishedDate || revision.date || null,
        docIds: [docId], docNames: [toText(doc.displayName)], text, changes,
        changedKeys: [...new Set(changes.map(change => `${docId}/${change.tweetId}`))],
        url: doc.url || '', href: `/revisions/${docId}/${revision.id}`, nativeImpact: revision.impact || null,
        services: { ids: [...services], basis: '改正条文の分類' },
        sourceFingerprint: fingerprint(JSON.stringify([revision.effectiveDate, revision.date, revision.articles])),
      });
    }
  }
  return events;
}

export function findImpact(event, documents, catalog) {
  const changed = new Set(event.changedKeys || []);
  const mappings = (Array.isArray(documents.researchMappings) ? documents.researchMappings : []).filter(record => {
    if (record.deleted) return false;
    return event.kind === 'company' ? event.docIds.includes(record.company?.docId) : changed.has(`${record.regulation?.docId}/${record.regulation?.itemId}`);
  }).map(record => ({ record,
    regulation: catalog.byKey.get(`${record.regulation?.docId}/${record.regulation?.itemId}`),
    company: catalog.byKey.get(`${record.company?.docId}/${record.company?.itemId}`),
    basis: event.kind === 'company' ? 'document-candidate' : 'changed-item',
  }));
  const affectedKeys = new Set(changed);
  for (const value of mappings) {
    if (value.regulation) affectedKeys.add(rowKey(value.regulation));
    if (value.company) affectedKeys.add(rowKey(value.company));
  }
  const checklist = [];
  for (const [docId, doc] of Object.entries(documents)) {
    if (!doc || Array.isArray(doc)) continue;
    for (const [itemId, record] of Object.entries(doc.checklist || {})) {
      if (affectedKeys.has(`${docId}/${itemId}`) || (event.kind === 'company' && event.docIds.includes(docId))) {
        checklist.push({ docId, itemId, doc, record, row: catalog.byKey.get(`${docId}/${itemId}`) });
      }
    }
  }
  const regulationIds = new Set(checklist.flatMap(value => (value.record.regulations || []).map(regulation => regulation.id)));
  const internalRegulations = (documents.regulations || []).filter(regulation => regulationIds.has(regulation.id));
  const companyRows = [...new Map(mappings.filter(value => value.company).map(value => [rowKey(value.company), value.company])).values()];
  return { mappings, checklist, internalRegulations, companyRows,
    linked: !!(mappings.length || checklist.length || internalRegulations.length || event.nativeImpact),
    basis: event.kind === 'company' ? '対象文書に結びつく記録（変更箇所との一致は要確認）' : '改正対象の条文IDに結びつく記録',
  };
}

export function impactReviewState(review, event) {
  if (!review || review.deleted || !review.status) return '';
  return review.sourceFingerprint === event.sourceFingerprint ? review.status : 'changed';
}

export function saveImpactReview(documents, event, values, now = new Date().toISOString()) {
  if (!event?.eventKey || !REVIEW_STATES.some(state => state.id === (values.status || ''))) throw new Error('確認状況が不正です。');
  if (values.dueDate && !/^\d{4}-\d{2}-\d{2}$/.test(values.dueDate)) throw new Error('期限を日付で入力してください。');
  const records = Array.isArray(documents[IMPACT_REVIEW_KEY]) ? [...documents[IMPACT_REVIEW_KEY]] : [];
  const record = { id: event.eventKey, status: values.status || '', owner: String(values.owner || '').trim(),
    dueDate: values.dueDate || '', note: String(values.note || '').trim(), updatedAt: now,
    sourceFingerprint: event.sourceFingerprint, deleted: false };
  const at = records.findIndex(value => value.id === record.id);
  if (at < 0) records.push(record); else records[at] = record;
  documents[IMPACT_REVIEW_KEY] = records;
  return records;
}

export function selectEvents(events, { provider = '', docId = '', service = '', includeCommon = true, query = '', from = '', to = '', kind = '' } = {}) {
  const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  return events.filter(event => (!provider || event.provider === provider) && (!kind || event.kind === kind) &&
    (!docId || event.docIds.includes(docId)) && matchesService(event, service, includeCommon) &&
    (!from || (eventDate(event) && eventDate(event) >= from)) && (!to || (eventDate(event) && eventDate(event) <= to)) &&
    words.every(word => (event.text + ' ' + event.docNames.join(' ')).toLowerCase().includes(word)))
    .sort((left, right) => eventDate(right).localeCompare(eventDate(left)) || left.eventKey.localeCompare(right.eventKey));
}
