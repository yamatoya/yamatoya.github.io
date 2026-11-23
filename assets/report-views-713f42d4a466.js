import { REPORT_KEY, rowsReport, upsertReport, reportEntries, reportState, reportHtml, reportMarkdown, safeUrl } from "./report-model-932f100c817a.js";
import { DEFINITION_TERMS, definitionMatches } from "./definitions-model-95eab6076bfe.js";
import { providerEvents, regulatoryEvents } from "./history-model-df83819c7b49.js";
import { KINDS } from "./research-model-78e455728e09.js";
export function createReportViews(api, ui) {
  const { h, ref, computed, context, shell, field, select, button, badge, empty, evidence, serviceControls, scalar, sourceLinks } = ui;
  const lastAdded = ref('');
  const reportAction = (ctx, entry) => h('div', { class: 'research-report-action' }, [button(lastAdded.value === entry.id ? '追加済み・引用を更新' : 'レポートに追加', () => {
    try { api.updateDocuments(documents => upsertReport(documents, entry)); lastAdded.value = entry.id; } catch (error) { lastAdded.value = ''; alert(error.message); }
  }), lastAdded.value === entry.id ? ctx.link('/research-report', 'レポートを開く →') : null]);
  const Definitions = { name: 'ResearchDefinitions', setup() {
    const ctx = context(), term = computed(() => typeof ctx.route.query.term === 'string' ? ctx.route.query.term : '暗号資産');
    const matches = computed(() => definitionMatches(ctx.catalog, term.value, { provider: scalar(ctx.route.query.provider), kind: scalar(ctx.route.query.kind), definitionsOnly: ctx.route.query.mentions !== '1', ...ctx.serviceOptions.value }));
    const limit = ref(20);
    const chosen = side => matches.value.find(value => value.key === ctx.route.query[side]) || (side === 'r' ? matches.value.find(value => value.row.docId !== (matches.value.find(value => value.key === ctx.route.query.l) || matches.value[0])?.row.docId) || matches.value[1] : matches.value[0]);
    const column = side => {
      const value = chosen(side);
      return h('section', { class: 'research-compare-column' }, [field(side === 'l' ? '左の定義・言及' : '右の定義・言及', select(value?.key || '', [{ value: '', label: '未選択' }, ...matches.value.map(value => ({ value: value.key, label: `${api.toText(value.row.doc.displayName)} ／ ${value.row.item.index || '本文'}` }))], key => ctx.query({ [side]: key }), side === 'l' ? '左の定義・言及' : '右の定義・言及')),
        value ? h('div', {}, [badge(value.basis), h('blockquote', { class: 'research-definition-quote' }, value.quote), h('details', {}, [h('summary', {}, '前後を含む収録条文を読む'), evidence(ctx, value.row, '', { full: true, report: false })]), sourceLinks(ctx, value.row)]) : empty('比較する項目がありません。用語や絞り込み条件を変えてください。')]);
    };
    return () => {
      const selected = [...new Map([chosen('l'), chosen('r')].filter(Boolean).map(value => [value.key, value])).values()];
      const report = rowsReport('definitions', `用語「${term.value}」の比較`, selected.map(value => value.row), api.toText);
      report.blocks = report.blocks.map((block, index) => ({ ...block, text: selected[index].quote }));
      return shell(ctx, '用語・定義の比較', '同じ用語を文書ごとに探し、対象範囲や条件を原文で比較します。', [
        h('div', { class: 'research-toolbar' }, [field('比較する用語', h('input', { class: 'research-input', type: 'search', value: term.value, onInput: event => ctx.router.replace({ path: ctx.route.path, query: { ...ctx.route.query, term: event.target.value, l: undefined, r: undefined } }) })),
          field('よく使う用語', select('', [{ value: '', label: '用語を選ぶ' }, ...DEFINITION_TERMS.map(value => ({ value, label: value }))], value => { if (value) ctx.query({ term: value, l: '', r: '' }); }, 'よく使う用語')),
          field('資料の種類', select(scalar(ctx.route.query.kind), [{ value: '', label: 'すべて' }, ...KINDS.map(value => ({ value: value.id, label: value.name }))], kind => ctx.query({ kind, l: '', r: '' }), '資料の種類')),
          field('事業者', select(scalar(ctx.route.query.provider), [{ value: '', label: 'すべて' }, ...ctx.catalog.providers.map(value => ({ value, label: value }))], provider => ctx.query({ provider, l: '', r: '' }), '事業者')), ...serviceControls(ctx),
          h('label', {}, [h('input', { type: 'checkbox', checked: ctx.route.query.mentions === '1', onChange: event => ctx.query({ mentions: event.target.checked ? '1' : '', l: '', r: '' }) }), '単なる言及も含める'])]),
        h('p', { class: 'research-notice' }, '「とは」「をいう」等の表現と見出しから抽出した候補です。定義の対象が一致するとは限りません。参照先の条文・除外条件も確認してください。'),
        badge(`${matches.value.length}項目`), h('div', { class: 'research-comparison' }, [column('l'), column('r')]),
        selected.length ? reportAction(ctx, { ...report, caveat: '定義表現・見出しから抽出した候補の抜粋です。用語の同一性や適用範囲を自動判定していません。前後の文脈は出典の収録条文で確認できます。' }) : null,
        h('section', { class: 'research-section' }, [h('h2', {}, '該当する箇所'), ...matches.value.slice(0, limit.value).map(value => h('article', { class: 'research-evidence', key: value.key }, [h('h3', {}, api.toText(value.row.doc.displayName) + ' ／ ' + (value.row.item.index || '本文')), badge(value.basis), h('p', {}, value.quote.slice(0, 350) + (value.quote.length > 350 ? '…' : '')), button('左に選ぶ', () => ctx.query({ l: value.key })), button('右に選ぶ', () => ctx.query({ r: value.key }))])),
          !matches.value.length ? empty('一致する箇所がありません。「単なる言及も含める」や別の用語もお試しください。') : null, matches.value.length > limit.value ? button('さらに20件表示', () => { limit.value += 20; }) : null]),
      ]);
    };
  } };
  const Report = { name: 'ResearchReport', setup() {
    const ctx = context(), records = ref(api.loadDocuments()[REPORT_KEY] || []), settings = records.value.find(value => value.id === 'report-settings' && !value.deleted) || {};
    const title = ref(settings.title || '調査レポート'), author = ref(settings.author || ''), summary = ref(settings.summary || ''), notes = ref({}), message = ref('');
    const entries = computed(() => reportEntries(records.value));
    const events = [...providerEvents(api.historyData, api.loadDocuments(), api.toText), ...regulatoryEvents(api.loadDocuments(), ctx.catalog, api.toText)];
    const current = () => entries.value.map(entry => ({ ...entry, note: notes.value[entry.id] ?? entry.note }));
    const metadata = () => ({ title: title.value, author: author.value, summary: summary.value });
    const persist = callback => { try { api.updateDocuments(callback); records.value = api.loadDocuments()[REPORT_KEY] || []; message.value = 'この端末に保存しました。記録のバックアップにも含まれます。'; } catch (error) { message.value = error.message; } };
    const save = () => persist(documents => { upsertReport(documents, { id: 'report-settings', kind: 'settings', ...metadata() }); for (const entry of current()) upsertReport(documents, entry); });
    const remove = entry => persist(documents => upsertReport(documents, { ...entry, deleted: true }));
    const move = (entry, direction) => {
      const next = [...entries.value], at = next.findIndex(value => value.id === entry.id), other = at + direction;
      if (other < 0 || other >= next.length) return;
      [next[at], next[other]] = [next[other], next[at]];
      persist(documents => next.forEach((value, index) => upsertReport(documents, { ...value, order: index + 1 })));
    };
    const download = format => {
      const output = current().map(entry => ({ ...entry, caveat: [entry.caveat, states[reportState(entry, ctx.catalog, events)]].filter(Boolean).join(' ／ ') }));
      const text = format === 'html' ? reportHtml(output, metadata(), location.origin) : reportMarkdown(output, metadata(), location.origin);
      const url = URL.createObjectURL(new Blob([text], { type: format === 'html' ? 'text/html;charset=utf-8' : 'text/markdown;charset=utf-8' }));
      const anchor = document.createElement('a'); anchor.href = url; anchor.download = `research-report-${new Date().toISOString().slice(0, 10)}.${format === 'html' ? 'html' : 'md'}`; anchor.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
    };
    const input = (value, label) => field(label, h('input', { class: 'research-input', value: value.value, onInput: event => { value.value = event.target.value; } }));
    const states = { saved: '選択時の本文を保存', changed: '参照元が変更されています・再追加で更新', missing: '参照元が見つかりません・保存した引用を表示' };
    return () => shell(ctx, '調査レポート', '選択した資料・比較結果・改正確認を、出典と判断メモ付きでまとめます。', [
      h('p', { class: 'research-notice' }, '論点の資料、事業者間比較、新旧比較、改正の影響、用語比較から追加できます。引用は追加時のスナップショットです。再追加すると本文を更新し、判断メモを保持します。'),
      h('div', { class: 'research-toolbar' }, [input(title, 'レポート名'), input(author, '作成者')]), field('調査の目的・まとめ', h('textarea', { class: 'research-textarea', rows: 3, value: summary.value, onInput: event => { summary.value = event.target.value; } })),
      h('div', { class: 'research-context-actions' }, [button('編集内容を保存', save), button('HTMLを書き出す', () => download('html'), { disabled: !entries.value.length }), button('Markdownを書き出す', () => download('md'), { disabled: !entries.value.length }), button('印刷・PDFに保存', () => window.print(), { disabled: !entries.value.length })]), h('p', { role: 'status' }, message.value),
      !entries.value.length ? empty('レポートは空です。資料や比較画面で「レポートに追加」を押してください。') : null,
      h('div', { class: 'research-report-preview' }, [h('h1', {}, title.value), h('p', {}, `作成者 ${author.value || '未設定'} ／ 出力日 ${new Date().toLocaleDateString('ja-JP')}`), h('p', { class: 'research-preserve-lines' }, summary.value),
        ...current().map((entry, index) => h('section', { class: 'research-section', key: entry.id }, [h('h2', {}, `${index + 1}. ${entry.title}`), badge(states[reportState(entry, ctx.catalog, events)]), h('p', {}, `${entry.dates || ''} ／ 引用の収録 ${entry.capturedAt}`), entry.caveat ? h('p', {}, entry.caveat) : null,
          h('div', { class: 'research-report-edit' }, [button('上へ', () => move(entry, -1), { disabled: !index }), button('下へ', () => move(entry, 1), { disabled: index === entries.value.length - 1 }), button('レポートから外す', () => remove(entry))]),
          ...(entry.blocks || []).map(block => h('article', {}, [h('h3', {}, block.label), h('pre', { class: 'research-announcement' }, block.text), block.source ? h('div', { class: 'research-source-links' }, [h('span', {}, block.source.label), h('span', {}, `資料取得日 ${block.source.fetchedAt || '未記録'}`), ...[['公式原文', block.source.url], ['保存原本', block.source.localUrl]].filter(([, url]) => /^https?:\/\//.test(url || '') || url?.startsWith('/docs/')).map(([label, url]) => h('a', { href: safeUrl(url, location.origin), target: '_blank', rel: 'noopener noreferrer' }, label)), block.source.docId ? h('a', { href: safeUrl(`/document/${block.source.docId}/${block.source.itemId}`, location.origin), target: '_blank', rel: 'noopener noreferrer' }, '収録条文') : null]) : null])),
          h('h3', {}, '判断メモ'), h('p', { class: 'research-report-print-note research-preserve-lines' }, entry.note || '未記録'), field('判断メモ', h('textarea', { class: 'research-textarea research-report-edit', rows: 3, value: entry.note, onInput: event => { notes.value = { ...notes.value, [entry.id]: event.target.value }; } })),
        ])),
      ]),
    ]);
  } };
  return { Definitions, Report, reportAction };
}
