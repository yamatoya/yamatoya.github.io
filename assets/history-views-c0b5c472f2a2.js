import { providerEvents, regulatoryEvents, findImpact, selectEvents, eventDate, REVIEW_STATES, IMPACT_REVIEW_KEY, impactReviewState, saveImpactReview } from "./history-model-df83819c7b49.js";
import { eventReport } from "./report-model-932f100c817a.js";
import { serviceName } from "./services-48285ee69786.js";

export function createHistoryViews(api, ui) {
  const { h, ref, computed, watch, context, shell, serviceControls, select, field, badge, button, empty, evidence, scalar } = ui;
  const coverageName = value => ({ 'comparison-excerpts': '新旧の変更箇所を収録', 'comparison-images': '画像の新旧対照表', 'announcement-only': '告知のみ' })[value] || value;
  const external = (url, label) => /^https?:\/\//.test(url || '') || url?.startsWith('/docs/') ? h('a', { href: url, target: '_blank', rel: 'noopener noreferrer' }, label) : null;
  const stateName = value => value === 'changed' ? '資料更新・要再確認' : REVIEW_STATES.find(state => state.id === value)?.name || '未確認';
  function useEvents(impacts) {
    const ctx = context(), documents = api.loadDocuments();
    const events = [...providerEvents(api.historyData, documents, api.toText), ...(impacts ? regulatoryEvents(documents, ctx.catalog, api.toText) : [])];
    const query = key => scalar(ctx.route.query[key]);
    const page = ref(0), reviews = ref(documents[IMPACT_REVIEW_KEY] || []);
    const impactsByKey = new Map();
    const impact = event => {
      if (!impactsByKey.has(event.eventKey)) impactsByKey.set(event.eventKey, findImpact(event, documents, ctx.catalog));
      return impactsByKey.get(event.eventKey);
    };
    const review = event => reviews.value.find(value => value.id === event.eventKey);
    const filtered = computed(() => selectEvents(events, { provider: query('provider'), docId: query('doc'), query: query('q'), from: query('from'), to: query('to'), kind: query('kind'), ...ctx.serviceOptions.value }).filter(event =>
      (!query('coverage') || event.coverage === query('coverage')) && (!query('state') || (query('state') === 'unreviewed' ? !impactReviewState(review(event), event) : impactReviewState(review(event), event) === query('state'))) && (query('linked') !== '1' || impact(event).linked)));
    const selected = computed(() => query('event') ? filtered.value.find(event => event.eventKey === query('event') || event.id === query('event')) : filtered.value[0]);
    watch(() => JSON.stringify(ctx.route.query), () => { page.value = 0; });
    const documentOptions = computed(() => [...new Set(events.flatMap(event => event.docIds))].filter(id => !query('provider') || documents[id]?.company?.name === query('provider')));
    const input = (key, type = 'search') => h('input', { type, class: 'research-input', value: query(key), onInput: event => ctx.query({ [key]: event.target.value, event: '' }) });
    const filters = () => h('div', { class: 'research-toolbar' }, [
      field('事業者', select(query('provider'), [{ value: '', label: 'すべて' }, ...ctx.catalog.providers.map(value => ({ value, label: value }))], value => ctx.query({ provider: value, doc: '', event: '' }), '事業者')),
      field('対象文書', select(query('doc'), [{ value: '', label: 'すべての文書' }, ...documentOptions.value.map(id => ({ value: id, label: api.toText(documents[id].displayName) }))], value => ctx.query({ doc: value, event: '' }), '対象文書')),
      ...serviceControls(ctx), field('検索', input('q')), field('施行日・告知日から', input('from', 'date')), field('施行日・告知日まで', input('to', 'date')),
      impacts ? field('資料の種類', select(query('kind'), [{ value: '', label: 'すべて' }, { value: 'regulation', label: '法令・規則等' }, { value: 'company', label: '事業者公表資料' }], value => ctx.query({ kind: value, event: '' }), '資料の種類')) : field('収録範囲', select(query('coverage'), [{ value: '', label: 'すべて' }, ...['comparison-excerpts', 'comparison-images', 'announcement-only'].map(value => ({ value, label: coverageName(value) }))], value => ctx.query({ coverage: value, event: '' }), '収録範囲')),
      impacts ? field('確認状況', select(query('state'), [{ value: '', label: 'すべて' }, { value: 'unreviewed', label: '未確認' }, ...REVIEW_STATES.filter(state => state.id).map(state => ({ value: state.id, label: state.name })), { value: 'changed', label: '資料更新・要再確認' }], value => ctx.query({ state: value, event: '' }), '確認状況')) : null,
      impacts ? h('label', {}, [h('input', { type: 'checkbox', checked: query('linked') === '1', onChange: event => ctx.query({ linked: event.target.checked ? '1' : '', event: '' }) }), '対応づけ・記録のある改正だけ']) : null,
    ]);
    const dates = event => h('p', { class: 'research-event-date' }, `${event.effectiveDate ? '施行 ' + event.effectiveDate : '施行日 未確認'}${event.publishedDate ? ' ／ 告知 ' + event.publishedDate : ''}${event.scheduledEffectiveDates?.length ? ' ／ 告知に記載の予定日 ' + event.scheduledEffectiveDates.join('・') : ''}`);
    const timeline = () => h('section', { class: 'research-section' }, [h('h2', {}, `改定・改正 ${filtered.value.length}件`),
      h('p', {}, '施行日が確認できたものは施行日、未確認のものは告知日で並べています。日付の絞り込みも同じ基準です。'),
      ...filtered.value.slice(page.value * 12, (page.value + 1) * 12).map(event => h('article', { class: `research-event ${selected.value?.eventKey === event.eventKey ? 'selected' : ''}`, key: event.eventKey }, [
        h('h3', {}, ctx.link(`${ctx.route.path}?${new URLSearchParams({ ...ctx.route.query, event: event.eventKey })}`, event.title || event.docNames.join('・'))), dates(event),
        h('div', { class: 'research-meta' }, [badge(event.kind === 'company' ? event.provider : '法令・規則等'), event.coverage ? badge(coverageName(event.coverage)) : null,
          impacts ? badge(stateName(impactReviewState(review(event), event))) : null]),
        impacts ? h('p', {}, impact(event).linked ? `対応づけ ${impact(event).mappings.length}件 ／ 確認記録 ${impact(event).checklist.length}件 ／ 社内規程 ${impact(event).internalRegulations.length}件` : '未判定：対応づけ・記録なし') : null,
      ])),
      !filtered.value.length ? empty('条件に合う記録がありません。') : null,
      h('div', { class: 'research-pagination' }, [button('前へ', () => page.value--, { disabled: page.value === 0 }), h('span', {}, `${filtered.value.length ? page.value + 1 : 0} / ${Math.ceil(filtered.value.length / 12)}`), button('次へ', () => page.value++, { disabled: (page.value + 1) * 12 >= filtered.value.length })]),
    ]);
    const eventPicker = () => h('div', { class: 'ux-event-picker' }, field('表示する改定・改正', select(selected.value?.eventKey || '', [{ value: '', label: '記録を選んでください' }, ...filtered.value.map(event => ({ value: event.eventKey, label: `${eventDate(event) || '日付未確認'} ／ ${event.title || event.docNames.join('・')}` }))], value => ctx.query({ event: value }), '表示する改定・改正')));
    return { ctx, documents, query, selected, filters, timeline, dates, review, reviews, impact, eventPicker };
  }
  const History = { name: 'ProviderHistory', setup() {
    const state = useEvents(false), { ctx, selected, query } = state;
    const segmentId = ref(''), showDiff = ref(false);
    watch(() => selected.value?.eventKey, () => { segmentId.value = ''; showDiff.value = false; });
    const segments = computed(() => (selected.value?.segments || []).filter(segment => !query('doc') || !segment.docIds?.length || segment.docIds.includes(query('doc'))));
    const segment = computed(() => segments.value.find(value => value.id === segmentId.value) || segments.value[0]);
    const diff = computed(() => showDiff.value && segment.value?.beforeKnown && segment.value?.afterKnown ? api.diffHtml(segment.value.before, segment.value.after) : '');
    const detail = () => {
      const event = selected.value;
      if (!event) return empty('表示する告知を選んでください。選択した告知が絞り込み条件から外れている場合は、条件を変更してください。');
      const value = segment.value;
      return h('section', { class: 'research-section research-history-detail' }, [h('h2', {}, event.title), state.dates(event),
        event.lineage === 'legacy-vctrade' ? h('p', { class: 'research-notice' }, '旧VCTRADEの告知です。現在のサービス規約との連続性は確認していないため、現行文書への対応づけには含めていません。') : null,
        h('div', { class: 'research-source-links' }, [external(event.url, '公式の改定告知'), external(event.source, '保存した告知HTML（テキスト）'), ctx.link(`/revision-impacts?event=${encodeURIComponent(event.eventKey)}`, 'この改定の影響を確認')]),
        ...event.docIds.map(id => h('p', {}, [ctx.link(`/document/${id}`, api.toText(state.documents[id].displayName)), `（収録本文の取得日 ${state.documents[id].company?.fetchedAt || '未記録'}。この改定時点の全文とは限りません）`])),
        h('p', { class: 'research-notice' }, '新旧対照表に掲載された変更箇所の抜粋です。「略」や空欄は原本の記載に従います。過去の全文を復元したものではありません。'),
        segments.value.length ? field('比較する箇所・ページ', select(value?.id || '', segments.value.map(item => ({ value: item.id, label: `${item.docIds?.map(id => api.toText(state.documents[id]?.displayName || id)).join('・') || '告知本文'} ／ ${item.label}` })), id => { segmentId.value = id; }, '比較する箇所・ページ')) : empty('新旧の本文テキストは収録できていません。下の告知・原本をご確認ください。'),
        value ? h('div', { class: 'research-source-links' }, [external(value.source, 'この箇所の保存原本'), external(value.sourceUrl, '公式原本')]) : null,
        value ? h('div', { class: 'research-history-columns' }, [['改定前', value.before, value.beforeKnown], ['改定後', value.after, value.afterKnown]].map(([label, content, known]) => h('article', { class: 'research-evidence' }, [h('h3', {}, label), known ? h('div', { class: 'research-body', innerHTML: api.sanitize(content || '（原本の欄は空欄）') }) : empty('この側の本文は取得できていません。') ]))) : null,
        value?.beforeKnown && value?.afterKnown ? h('details', { class: 'research-section', onToggle: event => { showDiff.value = event.target.open; } }, [h('summary', {}, '差分を強調して表示（削除・追加）'), h('p', {}, '機械的な文字列比較です。改行やPDF抽出の違いも差分に含まれます。'), h('div', { class: 'research-body research-history-diff', innerHTML: api.sanitize(diff.value) })]) : null,
        ui.reportAction(ctx, eventReport(event, { segment: value, toText: api.toText, checkedAt: api.historyData.checkedAt })),
        h('h3', {}, '告知・対照表の原本'), ...event.evidence.map(source => h('div', { class: 'research-history-source' }, [h('p', {}, [external(source.localUrl, source.label || source.kind), ' ／ ', external(source.url, '公式原本')]), source.kind.includes('image') ? h('a', { href: source.localUrl, target: '_blank', rel: 'noopener noreferrer' }, h('img', { src: source.localUrl, alt: source.label || '告知に掲載された新旧対照表', loading: 'lazy' })) : null])),
        event.unresolvedPages?.length ? h('p', { class: 'research-notice' }, `表の抽出を確認できなかったページ：${JSON.stringify(event.unresolvedPages)}。原本をご確認ください。`) : null,
        h('details', {}, [h('summary', {}, '告知本文を読む'), h('pre', { class: 'research-announcement' }, event.announcementText)]),
      ]);
    };
    return () => shell(ctx, '事業者規約の新旧比較', '公式の過去の改定告知・新旧対照表から、変更された箇所を確認します。', [h('p', { class: 'research-notice' }, `${api.historyData.coverageNote} 調査日 ${api.historyData.checkedAt}。画像の対照表は原本を表示します。`), state.filters(), state.eventPicker(), h('div', { class: 'research-history-layout' }, [state.timeline(), detail()])]);
  } };
  const Impacts = { name: 'RevisionImpacts', setup() {
    const state = useEvents(true), { ctx, selected } = state;
    const status = ref(''), owner = ref(''), dueDate = ref(''), note = ref(''), message = ref('');
    watch(() => selected.value?.eventKey, () => {
      const record = selected.value && state.review(selected.value);
      status.value = record?.status || ''; owner.value = record?.owner || ''; dueDate.value = record?.dueDate || ''; note.value = record?.note || ''; message.value = '';
    }, { immediate: true });
    const input = (value, type = 'text') => h('input', { class: 'research-input', type, value: value.value, onInput: event => { value.value = event.target.value; } });
    const save = () => {
      const event = selected.value;
      if (!event) return;
      try {
        api.updateDocuments(documents => saveImpactReview(documents, event, { status: status.value, owner: owner.value, dueDate: dueDate.value, note: note.value }));
        state.reviews.value = api.loadDocuments()[IMPACT_REVIEW_KEY] || [];
        message.value = 'この端末に保存しました。ホームの「記録を書き出す」にも含まれます。';
      } catch (error) { message.value = error.message; }
    };
    const detail = () => {
      const event = selected.value;
      if (!event) return empty('表示する改定・改正を選んでください。');
      const impact = state.impact(event);
      return h('section', { class: 'research-section' }, [h('h2', {}, event.title || event.docNames.join('・')), state.dates(event),
        h('p', { class: 'research-notice' }, impact.basis + '。一覧は確認候補であり、対応の必要性や適合性を判定するものではありません。'),
        h('div', { class: 'research-source-links' }, [event.kind === 'company' ? ctx.link(`/provider-history?event=${encodeURIComponent(event.eventKey)}`, '改定告知・新旧比較') : ctx.link(event.href, '改正の詳細・既存の影響記録'), event.url ? external(event.url, '公式告知') : null]),
        event.nativeImpact ? h('article', { class: 'research-evidence' }, [h('h3', {}, '改正の詳細に保存された社内の対応'), h('p', {}, `状況 ${event.nativeImpact.status || '未設定'} ／ 担当 ${event.nativeImpact.owner || '未設定'} ／ 期限 ${event.nativeImpact.due || '未設定'}`), h('p', {}, event.nativeImpact.note || event.nativeImpact.areas || ''), ctx.link(event.href, '既存の対応記録を開く')]) : null,
        h('h3', {}, '関連する公表資料と対応づけ'), ...impact.companyRows.map(row => evidence(ctx, row, '', {})),
        ...impact.mappings.map(value => h('p', {}, [badge(value.basis === 'document-candidate' ? '文書単位の候補・箇所の一致は要確認' : '変更された条文IDと一致'), ' ', value.regulation ? ctx.link(`/document/${value.regulation.docId}/${value.regulation.item.id}`, api.toText(value.regulation.doc.displayName) + ' ' + value.regulation.item.index) : '規制側の参照元なし', ` ／ ${value.record.note || '根拠メモなし'}`])),
        !impact.mappings.length ? empty('対応づけの記録がありません。規制と公表資料の対応表で登録すると、ここからたどれます。') : null,
        h('h3', {}, '関連する社内規程'), ...impact.internalRegulations.map(regulation => h('p', {}, [regulation.url ? external(regulation.url, regulation.name || regulation.id) : regulation.name || regulation.id, ` ／ 担当 ${regulation.owner || '未設定'}`])),
        !impact.internalRegulations.length ? empty('関連づけられた社内規程はありません。') : null,
        h('h3', {}, '条文に残された確認記録'), ...impact.checklist.map(value => h('article', { class: 'research-evidence' }, [h('p', {}, ctx.link(`/document/${value.docId}/${value.itemId}`, `${api.toText(value.doc.displayName)} ${value.row?.item.index || value.itemId}`)), h('p', {}, `状況 ${value.record.status || '未設定'} ／ 担当 ${value.record.owner || '未設定'}`), h('p', {}, value.record.note || ''), h('p', {}, typeof value.record.evidence === 'string' ? value.record.evidence : '')])),
        !impact.checklist.length ? empty('関連する確認記録はありません。影響がないことを意味しません。') : null,
        ui.reportAction(ctx, eventReport(event, { impact, review: state.review(event), toText: api.toText, checkedAt: api.historyData.checkedAt })),
        h('h3', {}, 'この改定・改正の確認'), badge(stateName(impactReviewState(state.review(event), event))),
        h('div', { class: 'research-toolbar' }, [field('確認状況', select(status.value, REVIEW_STATES.map(value => ({ value: value.id, label: value.name })), value => { status.value = value; }, 'この改正の確認状況')), field('担当者', input(owner)), field('確認期限', input(dueDate, 'date'))]),
        field('判断の根拠・対応メモ', h('textarea', { class: 'research-textarea', rows: 4, value: note.value, onInput: event => { note.value = event.target.value; } })),
        button('確認記録を保存', save), h('p', { role: 'status' }, message.value), h('p', {}, '原資料の内容が変わった場合は「資料更新・要再確認」になります。記録はこのブラウザー内に保存されます。'),
      ]);
    };
    return () => shell(ctx, '改正の影響一覧', '法令・規則の改正と事業者資料の改定から、関連する記録を確認します。', [state.filters(), state.eventPicker(), h('div', { class: 'research-history-layout' }, [state.timeline(), detail()])]);
  } };
  return { History, Impacts };
}
