import { WORKSPACES, workspaceFor, activeFilters } from "./ux-model-9f325f4573ed.js";
import { KINDS, TOPICS } from "./research-model-78e455728e09.js";
import { serviceName } from "./services-48285ee69786.js";
export function createUxViews(api, ui) {
  const { h, ref, context, shell, button, badge, field, scalar } = ui;
  const icon = group => h('svg', { viewBox: '0 0 24 24', width: 20, height: 20, fill: 'none', stroke: 'currentColor', 'stroke-width': 1.6, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'aria-hidden': 'true' }, [h('path', { d: group.icon })]);
  const Nav = { name: 'WorkspaceNavigation', setup() {
    const ctx = context(false);
    return () => {
      const current = workspaceFor(ctx.route.path, ctx.route.query);
      return h('div', { class: `research-nav ux-navigation ${/^\/(library|document)/.test(ctx.route.path) ? 'library-open' : ''}` }, [
        h('p', { class: 'ux-nav-caption' }, '調査と対応のワークスペース'),
        ctx.link('/', 'ホーム', { class: `ux-nav-primary ${!current ? 'current' : ''}`, 'aria-current': !current ? 'page' : null }),
        ...WORKSPACES.map(group => h('div', { class: 'ux-nav-group', key: group.id }, [ctx.link(group.href, [icon(group), h('span', {}, group.label)], { class: `ux-nav-primary ${current?.id === group.id ? 'current' : ''}`, 'aria-current': current?.id === group.id && ctx.route.path === group.href ? 'page' : null }),
          current?.id === group.id ? h('ul', { class: 'ux-nav-children' }, group.links.map(([href,label]) => h('li', { key: href }, ctx.link(href, label, { class: ctx.route.path === href || ctx.route.path.startsWith(href + '/') ? 'current' : '', 'aria-current': ctx.route.path === href ? 'page' : null })))) : null,
        ])),
        /^\/document\//.test(ctx.route.path) ? h('p', { class: 'ux-nav-caption' }, '文書の目次') : null,
      ]);
    };
  } };
  function workspaceTabs(ctx) {
    const group = workspaceFor(ctx.route.path, ctx.route.query);
    if (!group || group.links.length < 2) return null;
    return h('nav', { class: 'research-tabs ux-local-tabs', 'aria-label': `${group.label}の機能` }, group.links.map(([href,label]) => ctx.link(href, label, { class: ctx.route.path === href || ctx.route.path.startsWith(href + '/') ? 'active' : '', 'aria-current': ctx.route.path === href ? 'page' : null })));
  }
  function filterPanel(ctx, controls) {
    const all = controls.filter(Boolean);
    if (all.length < 3) return h('div', { class: 'research-toolbar ux-filter-simple' }, all);
    const label = node => node?.children?.[0]?.children;
    const searchLabels = ['検索','本文・文書名を絞り込む','比較する用語'];
    const first = all.find(node => searchLabels.includes(label(node))) || all[0];
    const second = all.find(node => node !== first && ['事業者','論点','対象サービス'].includes(label(node))) || all.find(node => node !== first);
    const primary = [first, second].filter(Boolean), rest = all.filter(node => !primary.includes(node));
    const active = activeFilters(ctx.route.query);
    const names = { provider: '事業者', doc: '対象文書', service: 'サービス', common: '共通資料を除外', q: '語句', kind: '資料の種類', coverage: '収録範囲', state: '確認状況', linked: '記録あり', from: '開始日', to: '終了日', mentions: '言及も含む' };
    const value = key => key === 'service' ? serviceName(ctx.route.query[key]) : key === 'kind' ? KINDS.find(kind => kind.id === ctx.route.query[key])?.name || ctx.route.query[key] : ['linked','mentions','common'].includes(key) ? '' : key === 'doc' ? api.toText(api.loadDocuments()[ctx.route.query[key]]?.displayName || '選択中') : ctx.route.query[key];
    return h('section', { class: 'ux-filter-panel', 'aria-label': '絞り込み条件' }, [h('div', { class: 'research-toolbar' }, primary),
      rest.length ? h('details', { class: 'ux-advanced-filters' }, [h('summary', {}, ['詳細条件', active.length ? h('span', { class: 'ux-filter-count' }, `${active.length}件設定中`) : null]), h('div', { class: 'research-toolbar secondary' }, rest)]) : null,
      active.length ? h('div', { class: 'ux-active-filters', 'aria-label': '設定中の条件' }, [ ...active.map(key => h('button', { type: 'button', class: 'ux-filter-chip', onClick: () => ctx.query({ [key]: '', event: '', l: '', r: '' }), 'aria-label': `${names[key]}の条件を解除` }, `${names[key]}${value(key) ? '：' + value(key) : ''} ×`)), button('条件をクリア', () => ctx.query(Object.fromEntries([...active, 'event','l','r'].map(key => [key,'']))))]) : null,
    ]);
  }
  const Home = { name: 'ResearchWorkbench', setup() {
    const ctx = context(false), query = ref(''), documents = api.loadDocuments();
    const reportCount = (documents.researchReport || []).filter(value => !value.deleted && value.kind !== 'settings').length;
    const pending = (documents.researchImpactReviews || []).filter(value => !value.deleted && value.status === 'reviewing').length;
    return () => h('section', { class: 'research research-home ux-workbench', 'aria-label': '調査と対応のホーム' }, [
      h('header', { class: 'ux-hero' }, [h('p', { class: 'ux-eyebrow' }, '法令・ガイドライン ビューア'), h('h1', {}, '根拠を読み、対応を考える。'), h('p', {}, '法令・自主規制規則と事業者の公表資料を調べ、比較し、判断の根拠を残すためのワークスペース。'),
        h('form', { class: 'ux-home-search', role: 'search', onSubmit: event => { event.preventDefault(); if (query.value.trim()) ctx.router.push({ path: '/', query: { q: query.value.trim() } }); } }, [h('label', { class: 'visually-hidden', for: 'workspace-search' }, '資料の全文検索'), h('input', { id: 'workspace-search', class: 'research-input', type: 'search', value: query.value, placeholder: '用語・条文・項番から探す', onInput: event => { query.value = event.target.value; } }), h('button', { type: 'submit', class: 'research-button primary' }, '検索')]),
        h('p', { class: 'ux-search-hint' }, [ctx.link('/library', '文書一覧から探す'), h('span', {}, '・'), ctx.link('/topics', '論点から探す')]),
      ]),
      h('div', { class: 'ux-workflow-heading' }, [h('h2', {}, '目的からはじめる'), h('span', {}, '必要な作業から、いつでも')]),
      h('div', { class: 'ux-workflow-grid' }, WORKSPACES.slice(0,3).map((group,index) => ctx.link(group.href, [h('div', { class: 'ux-workflow-number' }, String(index + 1).padStart(2,'0')), icon(group), h('h3', {}, group.label), h('p', {}, group.description), h('span', { class: 'ux-card-arrow', 'aria-hidden': 'true' }, '→')], { class: 'ux-workflow-card' }))),
      h('section', { class: 'ux-resume' }, [h('div', {}, [h('h2', {}, '調査結果をまとめる'), h('p', {}, reportCount ? `レポートに保存した項目 ${reportCount}件` : '資料や比較画面から必要な項目を選び、出典と判断メモをまとめられます。')]), ctx.link('/research-report', '調査レポートを開く →')]),
      pending ? h('p', { class: 'ux-pending' }, [badge(`確認中 ${pending}件`), ctx.link('/revision-impacts?state=reviewing', '確認作業を続ける')]) : null,
      h('footer', { class: 'ux-home-footnote' }, [h('p', {}, '事業者の公表資料は、比較・調査のための参考資料です。自社の対応記録とは分けて扱います。'), ctx.link('/work', '対応記録の使い方')]),
    ]);
  } };
  const LibraryHeader = { name: 'LibraryHeader', setup() {
    const ctx = context(false);
    return () => h('header', { class: 'index-header ux-library-header' }, [h('p', { class: 'ux-eyebrow' }, '資料ライブラリ'), h('h1', {}, ctx.route.query.q ? '検索結果' : '資料を探す'), h('p', { class: 'index-lead' }, ctx.route.query.q ? `「${scalar(ctx.route.query.q)}」を収録資料から検索しています。` : '法令・ガイドライン・自主規制規則と、事業者の公表資料を原文から調べられます。')]);
  } };
  const descriptions = {
    '/provider-compare': '同じ論点の規約や方針を、事業者ごとに並べて読む。', '/provider-history': '公式告知と新旧対照表から、過去の変更箇所を確認する。', '/definitions': '同じ用語の定義や対象範囲を、文書ごとに比べる。',
    '/revision-impacts': '変更された規制・資料から、関連記録と確認すべき箇所をたどる。', '/regulation-map': '規制の条文と公表資料を、原文を確かめながら結びつける。', '/impacts': '法令・規則の改正に対する、社内の対応状況を記録する。', '/regulations': '社内規程を登録し、確認した条文や記録から参照する。', '/roles': '担当する役割に沿って、確認すべき事項を整理する。', '/work': '条文・社内規程・改正対応の記録方法を確認する。',
  };
  const Hub = { name: 'WorkspaceHub', setup() {
    const ctx = context(false);
    return () => {
      const group = workspaceFor(ctx.route.path, ctx.route.query) || WORKSPACES[1];
      return shell(ctx, group.label, group.description, [h('div', { class: 'ux-tool-grid' }, group.links.map(([href,label],index) => ctx.link(href, [h('span', { class: 'ux-tool-number' }, String(index + 1).padStart(2,'0')), h('div', {}, [h('h2', {}, label), h('p', {}, descriptions[href] || group.description)]), h('span', { 'aria-hidden': 'true' }, '→')], { class: 'ux-tool-card' }))), h('p', { class: 'ux-hub-note' }, group.id === 'review' ? '公表資料との対応づけは確認の手がかりです。自社の対応の必要性や適合性は、原文と自社の状況を踏まえて判断してください。' : '比較した結果は「レポートに追加」から保存し、出典と判断メモをまとめられます。')]);
    };
  } };
  return { Nav, Home, Hub, LibraryHeader, workspaceTabs, filterPanel };
}
