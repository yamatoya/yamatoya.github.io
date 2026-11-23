// One information architecture shared by desktop navigation, mobile and hubs.
export const WORKSPACES = [
  { id: 'sources', label: '資料を探す', href: '/library', description: '法令・規則と事業者の公表資料を、原文から調べる。', icon: 'M4 4h6a2 2 0 0 1 2 2v14a4 4 0 0 0-4-2H4z M20 4h-6a2 2 0 0 0-2 2v14a4 4 0 0 1 4-2h4z',
    links: [['/library','文書一覧・全文検索'], ['/topics','論点から探す']] },
  { id: 'compare', label: '比較する', href: '/compare', description: '事業者間の違い、過去の改定、用語の定義を比べる。', icon: 'M4 7h15m-4-4 4 4-4 4 M20 17H5m4-4-4 4 4 4',
    links: [['/provider-compare','事業者間の比較'], ['/provider-history','新旧比較・改定履歴'], ['/definitions','用語・定義の比較']] },
  { id: 'review', label: '対応を確認する', href: '/review', description: '規制との関係を確かめ、担当・期限・判断の根拠を残す。', icon: 'M9 12l2 2 4-4 M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0',
    links: [['/revision-impacts','改正の影響を調べる'], ['/regulation-map','規制と公表資料の対応表'], ['/impacts','改正への社内対応'], ['/regulations','社内規程'], ['/roles','役割別の対応事項'], ['/work','対応の進め方']] },
  { id: 'reports', label: 'レポート', href: '/research-report', description: '調査の根拠と判断をまとめ、共有できる形にする。', icon: 'M6 3h8l4 4v14H6z M14 3v5h4 M9 12h6 M9 16h6',
    links: [['/research-report','調査レポート'], ['/report','社内対応の集計'], ['/lists','保存した条文・リスト']] },
];
export function workspaceFor(path, query = {}) {
  if (path === '/' && query.q) return WORKSPACES[0];
  if (/^\/(document|public-comment)(\/|$)/.test(path)) return WORKSPACES[0];
  if (/^\/(revisions|checklist)(\/|$)/.test(path)) return WORKSPACES[2];
  return WORKSPACES.find(group => group.href === path || path.startsWith(group.href + '/') || group.links.some(([href]) => path === href || path.startsWith(href + '/'))) || null;
}
export const FILTER_KEYS = ['provider','doc','service','common','q','kind','coverage','state','linked','from','to','mentions'];
export function activeFilters(query) { return FILTER_KEYS.filter(key => typeof query[key] === 'string' && query[key] !== ''); }
