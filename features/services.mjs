export const SERVICES = [
  { id: 'spot', name: '現物取引', terms: ['現物取引', '販売所', '板取引'] },
  { id: 'leverage', name: 'レバレッジ・信用取引', terms: ['レバレッジ', '信用取引', '証拠金', 'ロスカット'] },
  { id: 'lending', name: '貸借・レンディング', terms: ['貸借', '貸コイン', 'レンディング', '消費貸借'] },
  { id: 'staking', name: 'ステーキング', terms: ['ステーキング'] },
  { id: 'recurring', name: '積立・つみたて', terms: ['積立', 'つみたて'] },
  { id: 'payment', name: '電子決済手段', terms: ['電子決済手段', 'ステーブルコイン'] },
  { id: 'wallet', name: 'Web3・NFT', terms: ['Web3', 'NFT', 'ウォレットサービス'] },
  { id: 'brokerage', name: '仲介・連携口座', terms: ['仲介', '連携口座', '媒介サービス'] },
  { id: 'common', name: '共通資料', terms: [] },
  { id: 'unknown', name: '未分類', terms: [] },
];
const normalize = value => String(value || '').normalize('NFKC').replace(/\s+/g, '').toLowerCase();
const specificDocs = {
  'sbivc-lending-terms': ['lending'], 'sbivc-lending-manual': ['lending'], 'sbivc-web3-terms': ['wallet'], 'sbivc-mits-terms': ['wallet'],
  'mercoin_auto_invest_tos': ['recurring'], 'mercoin_auto_invest_es': ['recurring'],
  'mercoin_intermediary_tos': ['brokerage'], 'mercoin_intermediary_es': ['brokerage'],
  'mercoin_intermediary_crypto_overview': ['brokerage'],
};
const baseDocs = {
  'sbivc-service-terms': ['spot', 'leverage', 'payment'], 'sbivc-crypto-manual': ['spot', 'leverage', 'staking', 'recurring'],
  'sbivc-payment-manual': ['payment'], 'sbivc-asset-overview': ['spot', 'payment'],
  mercoin_tos: ['spot'], mercoin_es: ['spot'], mercoin_crypto_overview: ['spot'],
};

export function classifyServices(docId, doc, index = '', text = '') {
  const explicit = doc.company?.services || doc.services;
  if (Array.isArray(explicit) && explicit.some(id => SERVICES.some(service => service.id === id))) {
    return { ids: explicit.filter(id => SERVICES.some(service => service.id === id)), basis: '登録された対象サービス' };
  }
  if (specificDocs[docId]) return { ids: specificDocs[docId], basis: '文書の対象サービス' };
  const title = normalize(doc.displayName);
  if (doc.company && (/方針|ポリシー|倫理|個人情報|苦情|履歴情報|トラベルルール|電磁的/.test(title) || doc.company.kind === '方針')) {
    return { ids: ['common'], basis: '事業者共通の方針・説明' };
  }
  if (/つみたて|積立/.test(title)) return { ids: ['recurring'], basis: '文書の名称' };
  if (/貸借|レンディング|貸コイン/.test(title)) return { ids: ['lending'], basis: '文書の名称' };
  if (/web3|nft/.test(title)) return { ids: ['wallet'], basis: '文書の名称' };
  if (/連携口座|仲介|媒介取扱/.test(title) && doc.company) return { ids: ['brokerage'], basis: '文書の名称' };
  const body = normalize(index + ' ' + text);
  const ids = SERVICES.filter(service => service.terms.some(term => body.includes(normalize(term)))).map(service => service.id);
  if (ids.length) return { ids, basis: '本文・見出しの言及' };
  if (baseDocs[docId]) return { ids: baseDocs[docId], basis: '文書の対象サービス（共通条項）' };
  return { ids: [doc.company ? 'unknown' : 'common'], basis: doc.company ? '対象サービスを未分類' : 'サービスを限定しない資料' };
}

export function matchesService(row, service = '', includeCommon = true) {
  if (!service) return true;
  const ids = row.services?.ids || ['unknown'];
  return ids.includes(service) || (includeCommon && service !== 'unknown' && ids.includes('common'));
}

export function serviceName(id) { return SERVICES.find(service => service.id === id)?.name || id; }

export function withServiceQuery(href, query = {}) {
  if (!/^\/(?:topics|provider-compare|regulation-map|provider-history|revision-impacts|definitions|research-report|library|compare|review)(?:[/?]|$)/.test(href)) return href;
  const url = new URL(href, 'https://local.invalid');
  if (query.service && !url.searchParams.has('service')) url.searchParams.set('service', query.service);
  if (query.common === '0' && !url.searchParams.has('common')) url.searchParams.set('common', '0');
  return url.pathname + url.search;
}
