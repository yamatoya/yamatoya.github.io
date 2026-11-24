import {
  TOPICS, KINDS, MAPPING_KEY, buildCatalog, topicRows, excerpt, rowKey,
  isRegulation, rankCompanyCandidates, createMapping, resolveMapping, upsertMapping, normalize,
} from './research-model.mjs';
import { SERVICES, matchesService, serviceName, withServiceQuery } from './services.mjs';
import { createShareViews } from './share-views.mjs';
import { createUxViews } from './ux-views.mjs';
import { workspaceFor } from './ux-model.mjs';
import { rowsReport } from './report-model.mjs';
import { createReportViews } from './report-views.mjs';
import { createHistoryViews } from './history-views.mjs';

export function createResearchViews(api) {
  const { h: createVNode, ref, computed, watch, nextTick, useRoute, useRouter, loadDocuments,
    updateDocuments, dataKey, toText, sanitize, persistent } = api;
  // The deployed runtime exposes createVNode rather than Vue's h convenience
  // overload. Wrap single VNode children for native elements explicitly.
  const h = (type, props, children) => createVNode(type, props,
    children && typeof children === 'object' && !Array.isArray(children) ? [children] : children);
  let cachedKey, cachedCatalog;
  function catalog() {
    const key = dataKey();
    if (!cachedCatalog || key !== cachedKey) {
      cachedCatalog = buildCatalog(loadDocuments(), toText);
      cachedKey = key;
    }
    return cachedCatalog;
  }
  const scalar = value => typeof value === 'string' ? value : '';
  const title = row => `${toText(row.doc.displayName)} · ${row.trail ? row.trail + ' / ' : ''}${row.item.index || '本文'}`;
  const formatDay = value => value && !Number.isNaN(Date.parse(value)) ? new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric', month: '2-digit', day: '2-digit', timeZone: 'Asia/Tokyo',
  }).format(new Date(value)) : '未記録';
  const short = (text, max = 90) => text.length > max ? text.slice(0, max) + '…' : text;
  const badge = (text, tone = '') => h('span', { class: `research-badge ${tone}` }, text);
  const empty = text => h('p', { class: 'research-empty' }, text);
  const button = (text, action, options = {}) => h('button', { type: 'button', class: `research-button ${['確認記録を保存', 'HTMLを書き出す'].includes(text) ? 'primary' : ''}`, onClick: action, ...options }, text);
  const field = (label, control) => h('label', { class: 'research-field' }, [h('span', { class: 'research-label' }, label), control]);
  const select = (value, options, change, label) => h('select', {
    class: 'research-select', value, 'aria-label': label, onChange: event => change(event.target.value),
  }, options.map(option => h('option', { key: option.value, value: option.value }, option.label)));
  const kindName = kind => KINDS.find(value => value.id === kind)?.name || '資料';

  function context(withCatalog = true) {
    const route = useRoute(), router = useRouter();
    const link = (href, label, props = {}) => h('a', {
      href: withServiceQuery(href, route.query), ...props,
      onClick: event => {
        if (event.button || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
        event.preventDefault(); router.push(withServiceQuery(href, route.query));
      },
    }, label);
    const query = patch => {
      const next = { ...route.query, ...patch };
      for (const key of Object.keys(next)) if (next[key] === '' || next[key] == null) delete next[key];
      router.replace({ path: route.path, query: next });
    };
    const topic = computed(() => TOPICS.find(value => value.id === scalar(route.params.topicId || route.query.topic)) ||
      (route.params.topicId ? null : TOPICS[0]));
    const serviceOptions = computed(() => ({ service: SERVICES.some(service => service.id === route.query.service) ? route.query.service : '', includeCommon: route.query.common !== '0' }));
    return { route, router, link, query, topic, serviceOptions, catalog: withCatalog ? catalog() : null };
  }

  function serviceControls(ctx) {
    return [field('対象サービス', select(ctx.serviceOptions.value.service, [{ value: '', label: 'すべてのサービス' }, ...SERVICES.map(service => ({ value: service.id, label: service.name }))],
      service => ctx.query({ service, event: '', l: '', r: '', ldoc: '', rdoc: '' }), '対象サービス')),
    ctx.serviceOptions.value.service && !['common', 'unknown'].includes(ctx.serviceOptions.value.service) ? h('label', { class: 'research-check' }, [
      h('input', { type: 'checkbox', checked: ctx.serviceOptions.value.includeCommon, onChange: event => ctx.query({ common: event.target.checked ? '' : '0', event: '' }) }), '共通資料も含める',
    ]) : null];
  }

  function shell(ctx, heading, description, children) {
    const workspace = workspaceFor(ctx.route.path, ctx.route.query);
    let foundFilters = false;
    const content = children.map(node => {
      if (!foundFilters && node?.props?.class === 'research-toolbar') { foundFilters = true; return ux.filterPanel(ctx, node.children || []); }
      return node;
    });
    return h('div', { class: 'research page' }, [h('div', { class: 'research-container' }, [
      h('header', { class: 'research-header' }, [workspace?.label !== heading ? h('p', { class: 'ux-eyebrow' }, workspace?.label || '調査ワークスペース') : null, h('h1', {}, heading), h('p', {}, description)]),
      ux.workspaceTabs(ctx), ...content,
    ])]);
  }
  function topicSelect(ctx) {
    return field('論点', select(ctx.topic.value?.id || '', TOPICS.map(topic => ({ value: topic.id, label: topic.name })),
      topic => ctx.query({ topic, l: '', r: '', ldoc: '', rdoc: '', rule: '' }), '論点'));
  }
  function sourceLinks(ctx, row) {
    const links = [ctx.link(`/document/${row.docId}/${row.item.id}`, '条文ページ', { class: 'research-text-link' })];
    if (/^https?:\/\//.test(row.doc.url || '')) links.push(h('a', { href: row.doc.url, target: '_blank', rel: 'noopener noreferrer' }, '公式原文'));
    if (row.doc.source?.localUrl?.startsWith('/docs/')) links.push(h('a', {
      href: row.doc.source.localUrl + `#page=${row.item.sourcePages?.[0] || 1}`, target: '_blank', rel: 'noopener noreferrer',
    }, '保存した原本PDF'));
    if (row.kind === 'company') links.push(ctx.link(`/provider-history?doc=${encodeURIComponent(row.docId)}`, '過去の改定・新旧比較'));
    return h('div', { class: 'research-source-links' }, links);
  }
  function evidence(ctx, row, topicId, { full = false, report = !full } = {}) {
    return h('article', { class: 'research-evidence', key: rowKey(row) }, [
      h('div', { class: 'research-meta' }, [badge(kindName(row.kind)), row.provider ? badge(row.provider) : null,
        row.doc.company?.fetchedAt ? h('span', {}, `取得 ${row.doc.company.fetchedAt}`) : null,
        ]),
      h('h3', {}, ctx.link(`/document/${row.docId}/${row.item.id}`, title(row))),
      full ? h('div', { class: 'research-body', innerHTML: sanitize(row.content) }) : h('p', { class: 'research-excerpt' }, excerpt(row, topicId)),
      h('details', { class: 'research-evidence-tools', open: full }, [h('summary', {}, report ? '出典・保存の操作' : '出典を確認'),
        h('p', { class: 'research-muted' }, `対象サービス：${row.services.ids.map(serviceName).join('・')} ／ ${row.services.basis}`),
        row.topics[topicId] ? h('p', { class: 'research-match-terms' }, `該当語句: ${row.topics[topicId].terms.join('・')}`) : null,
        sourceLinks(ctx, row), h(share.ShareQuote, { row }), report ? reports.reportAction(ctx, rowsReport('source', title(row), [row], toText)) : null,
      ]),
    ]);
  }

  const Topics = {
    name: 'ResearchTopics', setup() {
      const ctx = context(), limits = ref({});
      const rows = computed(() => ctx.topic.value ? topicRows(ctx.catalog, ctx.topic.value.id, {
        query: scalar(ctx.route.query.q), provider: scalar(ctx.route.query.provider),
        ...ctx.serviceOptions.value,
      }).filter(row => !ctx.route.query.kind || row.kind === ctx.route.query.kind) : []);
      watch(() => ctx.route.fullPath, () => { limits.value = {}; });
      return () => {
        if (!ctx.route.params.topicId) return shell(ctx, '論点から調べる', '同じ論点に関する法令・規則・事業者の公表資料をまとめて探せます。', [
          h('div', { class: 'research-toolbar' }, serviceControls(ctx)),
          h('p', { class: 'research-note' }, '分類は本文・見出しの語句による候補です。適用範囲や資料同士の関係は原文で確認できます。'),
          h('div', { class: 'research-topic-grid' }, TOPICS.map(topic => {
            const found = topicRows(ctx.catalog, topic.id, ctx.serviceOptions.value);
            const companies = new Set(found.filter(row => row.kind === 'company').map(row => row.provider));
            return ctx.link(`/topics/${topic.id}`, [h('h2', {}, topic.name), h('p', {}, topic.summary),
              h('span', { class: 'research-topic-count' }, `${found.filter(isRegulation).length} 規制の項目 · ${found.filter(row => row.kind === 'company').length} 事業者資料の項目 · ${companies.size} 事業者`),
            ], { class: 'research-topic-card' });
          })),
        ]);
        if (!ctx.topic.value) return shell(ctx, '論点が見つかりません', '一覧から論点を選び直してください。', [ctx.link('/topics', '論点一覧を開く')]);
        const topic = ctx.topic.value;
        return shell(ctx, topic.name, topic.summary, [
          h('div', { class: 'research-toolbar' }, [
            ...serviceControls(ctx),
            field('本文・文書名を絞り込む', h('input', { type: 'search', class: 'research-input', value: scalar(ctx.route.query.q),
              onInput: event => ctx.query({ q: event.target.value }), placeholder: '語句を入力' })),
            field('資料の種類', select(scalar(ctx.route.query.kind), [{ value: '', label: 'すべての種類' }, ...KINDS.map(kind => ({ value: kind.id, label: kind.name }))], kind => ctx.query({ kind }), '資料の種類')),
            field('事業者', select(scalar(ctx.route.query.provider), [{ value: '', label: 'すべての事業者・規制' }, ...ctx.catalog.providers.map(provider => ({ value: provider, label: provider }))], provider => ctx.query({ provider }), '事業者')),
          ]),
          h('div', { class: 'research-context-actions' }, [badge(`${rows.value.length} 項目`),
            ctx.link(`/provider-compare?topic=${topic.id}`, 'この論点で事業者を比較'), ctx.link(`/regulation-map?topic=${topic.id}`, 'この論点の対応表')]),
          h('p', { class: 'research-note' }, `検索対象の語句: ${topic.terms.join('・')}。本文・見出しから抽出した候補で、網羅性や法令への適合を示すものではありません。`),
          !rows.value.length ? empty('条件に合う項目がありません。絞り込み条件を変えてください。') : null,
          ...KINDS.map(kind => {
            const group = rows.value.filter(row => row.kind === kind.id), limit = limits.value[kind.id] || 6;
            if (!group.length) return null;
            return h('section', { class: 'research-section', key: kind.id }, [
              h('h2', {}, [kind.name, badge(`${group.length} 項目`)]),
              ...group.slice(0, limit).map(row => h('div', { key: rowKey(row) }, [evidence(ctx, row, topic.id),
                isRegulation(row) ? ctx.link(`/regulation-map?topic=${topic.id}&rule=${encodeURIComponent(rowKey(row))}`, 'この条文に事業者資料を対応づける', { class: 'research-map-link' }) : null])),
              group.length > limit ? button(`さらに表示（残り${group.length - limit}項目）`, () => { limits.value = { ...limits.value, [kind.id]: limit + 12 }; }) : null,
            ]);
          }),
        ]);
      };
    },
  };

  const Compare = {
    name: 'ProviderComparison', setup() {
      const ctx = context();
      const selectedRows = {};
      function column(side) {
        const topic = ctx.topic.value, providers = ctx.catalog.providers;
        const defaultProvider = providers[side === 'l' ? 0 : Math.min(1, providers.length - 1)] || '';
        const providerKey = side === 'l' ? 'left' : 'right';
        const provider = providers.includes(scalar(ctx.route.query[providerKey])) ? ctx.route.query[providerKey] : defaultProvider;
        const all = ctx.route.query[`${side}all`] === '1';
        const available = all ? ctx.catalog.rows.filter(row => row.provider === provider && row.kind === 'company' && matchesService(row, ctx.serviceOptions.value.service, ctx.serviceOptions.value.includeCommon)) : topicRows(ctx.catalog, topic.id, { kind: 'company', provider, ...ctx.serviceOptions.value });
        const docs = [...new Map(available.map(row => [row.docId, row.doc])).entries()];
        const wanted = available.find(row => rowKey(row) === ctx.route.query[side]);
        const docId = docs.some(([id]) => id === ctx.route.query[`${side}doc`]) ? ctx.route.query[`${side}doc`] : wanted?.docId || docs[0]?.[0];
        const items = available.filter(row => row.docId === docId);
        const selected = wanted?.docId === docId ? wanted : items[0];
        selectedRows[side] = selected;
        return h('section', { class: 'research-compare-column', 'aria-label': side === 'l' ? '左側の事業者資料' : '右側の事業者資料' }, [
          h('div', { class: 'research-column-controls' }, [
            field(side === 'l' ? '左側の事業者' : '右側の事業者', select(provider, providers.map(name => ({ value: name, label: name })),
              value => ctx.query({ [providerKey]: value, [side]: '', [`${side}doc`]: '' }), `${side === 'l' ? '左側' : '右側'}の事業者`)),
            h('label', { class: 'research-check' }, [h('input', { type: 'checkbox', checked: all,
              onChange: event => ctx.query({ [`${side}all`]: event.target.checked ? '1' : '', [side]: '', [`${side}doc`]: '' }) }), '論点以外の資料も選ぶ（サービス条件は維持）']),
            field('文書', select(docId || '', docs.map(([id, doc]) => ({ value: id, label: toText(doc.displayName) })),
              value => ctx.query({ [`${side}doc`]: value, [side]: '' }), `${side === 'l' ? '左側' : '右側'}の文書`)),
            field('条文・項目', select(selected ? rowKey(selected) : '', items.map(row => ({ value: rowKey(row), label: short(row.item.index || '本文') })),
              value => ctx.query({ [side]: value }), `${side === 'l' ? '左側' : '右側'}の条文・項目`)),
            h('span', { class: 'research-muted' }, all ? `${available.length}項目から選択` : `この論点の候補 ${available.length}項目`),
          ]),
          selected ? evidence(ctx, selected, topic.id, { full: true }) : empty('この事業者の候補はありません。「全資料から選ぶ」で他の項目も確認できます。'),
        ]);
      }
      return () => shell(ctx, '事業者間の規約比較', '同じ論点の規約・方針を横並びに表示します。左右の文書と条文は自由に選べます。', [
        h('div', { class: 'research-toolbar' }, [topicSelect(ctx), ...serviceControls(ctx),
          ctx.link(`/topics/${ctx.topic.value.id}`, 'この論点の全資料'), ctx.link(`/regulation-map?topic=${ctx.topic.value.id}`, '規制との対応を調べる')]),
        h('p', { class: 'research-note' }, '同じ語句を含む項目を候補として表示します。サービスの対象・契約条件・取得日も確かめながら比較してください。'),
        ctx.catalog.providers.length ? h('div', { class: 'research-comparison' }, [column('l'), column('r')]) : empty('比較できる事業者資料がありません。'),
        selectedRows.l && selectedRows.r ? reports.reportAction(ctx, rowsReport('comparison', `${ctx.topic.value.name}の事業者間比較`, [selectedRows.l, selectedRows.r], toText)) : null,
      ]);
    },
  };

  const Mapping = {
    name: 'RegulationSourceMap', setup() {
      const ctx = context(), records = ref(loadDocuments()[MAPPING_KEY] || []), selectedRule = ref(scalar(ctx.route.query.rule));
      const selectedCompany = ref(''), note = ref(''), message = ref(''), failed = ref(false), page = ref(0), expanded = ref(false);
      const headingRef = ref(null), formProvider = ref(ctx.catalog.providers[0] || '');
      const active = computed(() => (Array.isArray(records.value) ? records.value : []).filter(record => !record.deleted && record.topicId === ctx.topic.value.id)
        .map(record => resolveMapping(record, ctx.catalog)));
      const providers = computed(() => ctx.route.query.provider && ctx.catalog.providers.includes(ctx.route.query.provider) ? [ctx.route.query.provider] : ctx.catalog.providers);
      const rule = computed(() => {
        const row = ctx.catalog.byKey.get(selectedRule.value);
        return row && isRegulation(row) ? row : null;
      });
      const candidates = computed(() => rankCompanyCandidates(ctx.catalog, rule.value, ctx.topic.value.id, formProvider.value, 8, ctx.serviceOptions.value));
      const companyOptions = computed(() => expanded.value ? ctx.catalog.rows.filter(row => row.kind === 'company' && row.provider === formProvider.value && matchesService(row, ctx.serviceOptions.value.service, ctx.serviceOptions.value.includeCommon)) : candidates.value.map(candidate => candidate.row));
      const company = computed(() => {
        const saved = ctx.catalog.byKey.get(selectedCompany.value);
        if (saved?.kind === 'company' && saved.provider === formProvider.value && matchesService(saved, ctx.serviceOptions.value.service, ctx.serviceOptions.value.includeCommon)) return saved;
        return companyOptions.value[0] || null;
      });
      const allRules = computed(() => {
        const found = topicRows(ctx.catalog, ctx.topic.value.id, { query: scalar(ctx.route.query.q), docId: scalar(ctx.route.query.doc), ...ctx.serviceOptions.value }).filter(isRegulation);
        const words = scalar(ctx.route.query.q).trim().split(/\s+/).filter(Boolean).map(normalize);
        // A saved relationship remains visible even after a text change removes
        // the words which originally classified its regulation under this topic.
        const saved = active.value.map(value => value.rule).filter(row => row && isRegulation(row) &&
          (!ctx.route.query.doc || row.docId === ctx.route.query.doc) && matchesService(row, ctx.serviceOptions.value.service, ctx.serviceOptions.value.includeCommon) && words.every(word =>
            (row.body + row.heading + normalize(row.doc.displayName)).includes(word)));
        return [...new Map([...found, ...saved].map(row => [rowKey(row), row])).values()];
      });
      const rules = computed(() => allRules.value.filter(row => {
        const relationships = active.value.filter(value => value.rule && rowKey(value.rule) === rowKey(row) && providers.value.includes(value.company?.provider));
        const state = scalar(ctx.route.query.status);
        return state === 'confirmed' ? relationships.some(value => value.state === 'confirmed') : state === 'review' ? relationships.some(value => value.state === 'changed') :
          state === 'unmapped' ? providers.value.some(provider => !relationships.some(value => value.state === 'confirmed' && value.company?.provider === provider)) : true;
      }));
      watch(() => ctx.route.query.topic, () => { selectedRule.value = ''; selectedCompany.value = ''; note.value = ''; message.value = ''; });
      watch(() => ctx.route.query.rule, value => { selectedRule.value = scalar(value); });
      watch(() => ctx.route.fullPath, () => { page.value = 0; });
      watch(() => rules.value.length, length => { page.value = Math.min(page.value, Math.max(0, Math.ceil(length / 8) - 1)); });
      watch([formProvider, expanded, selectedRule], () => { selectedCompany.value = ''; });
      const restoreNote = () => {
        const existing = active.value.find(value => value.rule && value.company && rule.value && company.value &&
          rowKey(value.rule) === rowKey(rule.value) && rowKey(value.company) === rowKey(company.value));
        note.value = existing?.record.note || '';
      };
      watch([() => company.value && rowKey(company.value), selectedRule], restoreNote, { immediate: true });
      function chooseRule(row) {
        selectedRule.value = rowKey(row); note.value = ''; message.value = ''; ctx.query({ rule: rowKey(row) });
        nextTick(() => { restoreNote(); headingRef.value?.focus(); headingRef.value?.scrollIntoView({ block: 'start', behavior: 'smooth' }); });
      }
      function save() {
        try {
          const record = createMapping(ctx.topic.value.id, rule.value, company.value, note.value);
          const result = updateDocuments(documents => upsertMapping(documents, record));
          records.value = [...result]; message.value = '対応づけと確認時点の本文を記録しました。'; failed.value = false;
        } catch (error) { message.value = error.message || '保存できませんでした。'; failed.value = true; }
      }
      function remove(record) {
        try {
          const result = updateDocuments(documents => upsertMapping(documents, { ...record, deleted: true, updatedAt: new Date().toISOString() }));
          records.value = [...result]; message.value = '対応づけを解除しました。'; failed.value = false;
        } catch (error) { message.value = error.message || '保存できませんでした。'; failed.value = true; }
      }
      function edit(resolved) {
        expanded.value = true; selectedRule.value = rowKey(resolved.rule); formProvider.value = resolved.company.provider;
        // Wait for selection-dependent watchers before restoring the exact source.
        nextTick(() => { selectedCompany.value = rowKey(resolved.company); note.value = resolved.record.note || ''; headingRef.value?.focus(); });
      }
      function relationship(value) {
        return h('div', { class: 'research-relationship', key: value.record.id }, [
          badge(value.state === 'confirmed' ? '対応づけを確認' : value.state === 'changed' ? '本文変更・再確認' : '参照元が見つかりません', value.state === 'confirmed' ? 'confirmed' : 'review'),
          value.company ? ctx.link(`/document/${value.company.docId}/${value.company.item.id}`, title(value.company)) : h('span', {}, `${value.record.company?.docId}/${value.record.company?.itemId}`),
          value.record.note ? h('p', { class: 'research-record-note' }, value.record.note) : null,
          h('span', { class: 'research-muted' }, `確認 ${formatDay(value.record.confirmedAt)}`),
          h('div', { class: 'research-inline-actions' }, [value.rule && value.company ? button('確認・メモを更新', () => edit(value)) : null, button('対応づけを解除', () => remove(value.record))]),
        ]);
      }
      return () => {
        const topic = ctx.topic.value, visible = rules.value.slice(page.value * 8, (page.value + 1) * 8);
        const docs = [...new Map(topicRows(ctx.catalog, topic.id, ctx.serviceOptions.value).filter(isRegulation).map(row => [row.docId, row.doc])).entries()];
        const missing = active.value.filter(value => value.state === 'missing');
        return shell(ctx, '規制と公表資料の対応表', '規制の条文ごとに、各事業者の関連資料を探し、確認した対応づけと根拠メモを記録できます。', [
          h('div', { class: 'research-toolbar' }, [topicSelect(ctx), ...serviceControls(ctx),
            field('事業者', select(scalar(ctx.route.query.provider), [{ value: '', label: 'すべての事業者' }, ...ctx.catalog.providers.map(name => ({ value: name, label: name }))], provider => ctx.query({ provider }), '対応表の事業者')),
            field('表示する状態', select(scalar(ctx.route.query.status), [
              { value: '', label: 'すべて' }, { value: 'unmapped', label: '未確認の事業者あり' }, { value: 'confirmed', label: '確認した対応づけあり' }, { value: 'review', label: '本文変更・再確認' },
            ], status => ctx.query({ status }), '表示する状態')),
          ]),
          h('div', { class: 'research-toolbar secondary' }, [
            field('規制の文書', select(scalar(ctx.route.query.doc), [{ value: '', label: 'すべての規制文書' }, ...docs.map(([id, doc]) => ({ value: id, label: toText(doc.displayName) }))], doc => ctx.query({ doc }), '規制の文書')),
            field('規制本文を絞り込む', h('input', { type: 'search', class: 'research-input', value: scalar(ctx.route.query.q), onInput: event => ctx.query({ q: event.target.value }), placeholder: '語句を入力' })),
          ]),
          h('p', { class: 'research-note' }, '「候補」は共通の語句から見つけた上位8件までの資料です。候補以外の全資料からも選べます。「対応づけを確認」は原文を見て記録した資料間の関係で、法令遵守の判定を意味しません。記録はこのブラウザに保存され、ホームの「記録を書き出す」に含まれます。'),
          !persistent() ? h('p', { role: 'alert', class: 'research-error' }, 'この環境では保存が利用できません。画面を閉じる前に記録を書き出してください。') : null,
          message.value ? h('p', { role: failed.value ? 'alert' : 'status', class: failed.value ? 'research-error' : 'research-success' }, message.value) : null,
          selectedRule.value && !rule.value ? empty('指定された規制の条文が見つかりません。対応表から選び直してください。') : null,
          rule.value ? h('section', { class: 'research-composer', 'aria-label': '対応づけの確認と記録' }, [
            h('h2', { ref: headingRef, tabindex: '-1' }, '対応づけを確認する'),
            h('div', { class: 'research-composer-grid' }, [
              h('div', {}, [h('h3', {}, '規制の条文'), evidence(ctx, rule.value, topic.id), h('details', {}, [h('summary', {}, '規制の本文全体'), h('div', { class: 'research-body', innerHTML: sanitize(rule.value.content) })])]),
              h('div', {}, [field('対応先の事業者', select(formProvider.value, ctx.catalog.providers.map(name => ({ value: name, label: name })), value => { formProvider.value = value; }, '対応先の事業者')),
                h('label', { class: 'research-check' }, [h('input', { type: 'checkbox', checked: expanded.value, onChange: event => { expanded.value = event.target.checked; } }), '共通語の候補以外も含め、全資料から選ぶ']),
                field('対応先の条文・項目', select(company.value ? rowKey(company.value) : '', companyOptions.value.map(row => ({ value: rowKey(row), label: short(title(row), 130) })), value => { selectedCompany.value = value; note.value = ''; }, '対応先の条文・項目')),
                company.value ? evidence(ctx, company.value, topic.id) : empty('候補がありません。全資料から選ぶか、事業者を変更してください。'),
                company.value ? h('details', {}, [h('summary', {}, '事業者資料の本文全体'), h('div', { class: 'research-body', innerHTML: sanitize(company.value.content) })]) : null,
              ]),
            ]),
            field('対応づけの根拠・メモ', h('textarea', { class: 'research-input', rows: 3, value: note.value, placeholder: 'どの記載がどう関連するか、対象サービスや確認上の留意点など', onInput: event => { note.value = event.target.value; } })),
            h('div', { class: 'research-inline-actions' }, [button('原文を確認して対応づけを記録', save, { disabled: !company.value, class: 'research-button primary' }),
              button('閉じる', () => { selectedRule.value = ''; ctx.query({ rule: '' }); })]),
          ]) : null,
          h('div', { class: 'research-context-actions' }, [badge(`${rules.value.length} 規制の項目`), badge(`${active.value.filter(value => value.state === 'confirmed').length} 対応づけを確認`),
            ctx.link(`/provider-compare?topic=${topic.id}`, '事業者の資料を横並びで比較')]),
          visible.length ? h('div', { class: 'research-table-wrap' }, [h('table', { class: 'research-map-table' }, [
            h('caption', { class: 'visually-hidden' }, `${topic.name}：規制と事業者の公表資料の対応表`),
            h('thead', {}, h('tr', {}, [h('th', { scope: 'col' }, '規制の条文'), ...providers.value.map(provider => h('th', { scope: 'col', key: provider }, provider))])),
            h('tbody', {}, visible.map(row => h('tr', { key: rowKey(row) }, [
              h('th', { scope: 'row' }, [badge(kindName(row.kind)), ctx.link(`/document/${row.docId}/${row.item.id}`, title(row)),
                h('p', { class: 'research-excerpt' }, excerpt(row, topic.id, 135)), button('対応資料を選ぶ', () => chooseRule(row))]),
              ...providers.value.map(provider => {
                const linked = active.value.filter(value => value.rule && rowKey(value.rule) === rowKey(row) && value.company?.provider === provider);
                const count = rankCompanyCandidates(ctx.catalog, row, topic.id, provider, 8, ctx.serviceOptions.value).length;
                return h('td', { key: provider }, linked.length ? linked.map(relationship) : [badge('未確認'), h('p', {}, count ? `共通語の候補 ${count}件` : '共通語の候補なし'),
                  button('候補を確認', () => { chooseRule(row); formProvider.value = provider; })]);
              }),
            ]))),
          ])]) : empty('条件に合う規制の項目がありません。絞り込みを変更してください。'),
          h('div', { class: 'research-pagination', 'aria-label': '対応表のページ切り替え' }, [
            button('前のページ', () => { page.value--; }, { disabled: page.value === 0 }), h('span', {}, `${rules.value.length ? page.value + 1 : 0} / ${Math.ceil(rules.value.length / 8)} ページ`),
            button('次のページ', () => { page.value++; }, { disabled: (page.value + 1) * 8 >= rules.value.length }),
          ]),
          missing.length ? h('section', { class: 'research-section' }, [h('h2', {}, '参照できない対応づけ'), h('p', {}, '文書や項目の削除・変更により、原文を開けなくなった記録です。'), ...missing.map(relationship)]) : null,
        ]);
      };
    },
  };
  const share = createShareViews(api, { h });
  const ux = createUxViews(api, { h, ref, context, shell, button, badge, field, scalar });
  const reports = createReportViews(api, { h, ref, computed, context, shell, serviceControls, select, field, badge, button, empty, evidence, sourceLinks, scalar });
  const history = createHistoryViews(api, { reportAction: reports.reportAction, h, ref, computed, watch, context, shell, serviceControls, select, field, badge, button, empty, evidence, sourceLinks, title, formatDay, scalar });
  return { Nav: ux.Nav, Home: ux.Home, Hub: ux.Hub, LibraryHeader: ux.LibraryHeader, Topics, Compare, Mapping, ...history, ...reports, ...share };
}
