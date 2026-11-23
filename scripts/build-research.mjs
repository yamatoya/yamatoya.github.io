// Package the readable research feature sources into this deployment checkout.
import { readFileSync, writeFileSync, unlinkSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const hash = text => createHash('sha256').update(text).digest('hex');
function asset(prefix, content, ext = 'js') {
  const name = `${prefix}-${hash(content).slice(0, 12)}.${ext}`;
  writeFileSync(resolve(root, 'assets', name), content);
  return name;
}
const packed = new Map();
function moduleAsset(name) {
  if (packed.has(name)) return packed.get(name);
  let source = readFileSync(resolve(root, 'features', name + '.mjs'), 'utf8');
  source = source.replace(/(['"])\.\/([\w-]+)\.mjs\1/g, (_, quote, dependency) => JSON.stringify('./' + moduleAsset(dependency)));
  const result = asset(name, source); packed.set(name, result); return result;
}
const view = moduleAsset('research-views');
const historyData = asset('provider-history-data', 'export default ' + readFileSync(resolve(root, 'features/provider-history-data.json'), 'utf8') + ';\n');
const css = asset('research', ['research.css', 'workspace.css'].map(name => readFileSync(resolve(root, 'features', name), 'utf8')).join('\n'), 'css');
let html = readFileSync(resolve(root, 'index.html'), 'utf8');
const previous = html.match(/src="\/assets\/(index-[^"/]+\.js)"/)[1];
let code = readFileSync(resolve(root, 'assets', previous), 'utf8');
const previousView = code.match(/import \{ createResearchViews \} from "\.\/(research-views-[a-f0-9]+\.js)";/)?.[1];
const oldModules = new Set();
function collectOld(name) {
  if (!name || oldModules.has(name)) return;
  oldModules.add(name);
  const source = readFileSync(resolve(root, 'assets', name), 'utf8');
  for (const match of source.matchAll(/from ["']\.\/((?:research-|history-|services-|report-|definitions-|ux-)[\w-]+\.js)["']/g)) collectOld(match[1]);
}
collectOld(previousView);
const previousData = code.match(/import historyData from "\.\/([^"/]+)"/)?.[1];
if (previousData) oldModules.add(previousData);
const previousCss = html.match(/href="\/assets\/(research-[a-f0-9]+\.css)"/)?.[1];
code = code.replace(/^import \{ createResearchViews \} from [^;]+;\n/m, '');
code = code.replace(/^import historyData from [^;]+;\n/m, '');
const firstLine = code.indexOf('\n') + 1;
code = code.slice(0, firstLine) + `import { createResearchViews } from "./${view}";\nimport historyData from "./${historyData}";\n` + code.slice(firstLine);
const factory = '/* RESEARCH_VIEWS_START */var researchViews=createResearchViews({historyData,diffHtml:Yx,h:U,ref:N,computed:K,watch:zn,nextTick:Sn,useRoute:ns,useRouter:ts,loadDocuments:tl,updateDocuments:nl,dataKey:()=>Z.getItem(X),toText:e=>Kl(e,` `),sanitize:am,persistent:()=>Z.persistent});/* RESEARCH_VIEWS_END */';
if (code.includes('/* RESEARCH_VIEWS_START */')) code = code.replace(/\/\* RESEARCH_VIEWS_START \*\/[\s\S]*?\/\* RESEARCH_VIEWS_END \*\//, factory);
else {
  if (!code.includes('var EN=zc(')) throw new Error('Router initialization not found');
  code = code.replace('var EN=zc(', factory + 'var EN=zc(');
}
const routes = '/* RESEARCH_ROUTES_START */{path:`/topics`,component:researchViews.Topics,name:`research-topics`},{path:`/topics/:topicId`,component:researchViews.Topics,name:`research-topic-detail`},{path:`/provider-compare`,component:researchViews.Compare,name:`research-compare`},{path:`/regulation-map`,component:researchViews.Mapping,name:`research-mapping`},{path:`/provider-history`,component:researchViews.History,name:`provider-history`},{path:`/revision-impacts`,component:researchViews.Impacts,name:`revision-impacts`},{path:`/definitions`,component:researchViews.Definitions,name:`research-definitions`},{path:`/research-report`,component:researchViews.Report,name:`research-report`},{path:`/library`,component:E_,name:`research-library`},{path:`/compare`,component:researchViews.Hub,name:`research-compare-hub`},{path:`/review`,component:researchViews.Hub,name:`research-review-hub`},/* RESEARCH_ROUTES_END */';
if (code.includes('/* RESEARCH_ROUTES_START */')) code = code.replace(/\/\* RESEARCH_ROUTES_START \*\/[\s\S]*?\/\* RESEARCH_ROUTES_END \*\//, routes);
else code = code.replace('var EN=zc({history:sc(),routes:[', 'var EN=zc({history:sc(),routes:[' + routes);
if (!code.includes('U(researchViews.Nav)')) {
  const anchor = 't[17]||=H(`h2`,{class:`nav-heading`},`文書`,-1)';
  if (!code.includes(anchor)) throw new Error('Navigation insertion point not found');
  code = code.replace(anchor, 'U(researchViews.Nav),' + anchor);
}
if (!code.includes('U(researchViews.Home)')) {
  const anchor = 'r.showGuide&&!e.searchQuery?(z(),B(`section`,xg';
  if (!code.includes(anchor)) throw new Error('Home insertion point not found');
  code = code.replace(anchor, '!e.searchQuery?U(researchViews.Home):G(``,!0),' + anchor);
}
if (!code.includes('/* RESEARCH_SCROLL */')) {
  code = code.replace('EN.afterEach((e,t)=>{e.name===`tweet`', 'EN.afterEach((e,t)=>{/* RESEARCH_SCROLL */if(e.name?.startsWith(`research-`)&&e.path!==t.path){wN();return}e.name===`tweet`');
}
code = code.replace('e.name?.startsWith(`research-`)&&e.path!==t.path', '(e.name?.startsWith(`research-`)||[`provider-history`,`revision-impacts`].includes(e.name))&&e.path!==t.path');
if (!code.includes('U(researchViews.LibraryHeader)')) {
  const header = 't[52]||=H(`header`,{class:`index-header`},[H(`h1`,null,`文書一覧と全文検索`),H(`p`,{class:`index-lead`},`金融庁の事務ガイドライン・関係法令・パブリックコメントの結果などを、改正履歴とあわせて読めます。`)],-1)';
  if (!code.includes(header)) throw new Error('Library header insertion point not found');
  code = code.replace(header, 'U(researchViews.LibraryHeader)');
}
// Keep result counts visible while moving native search options behind disclosure.
if (!code.includes('/* UX_SEARCH_OPTIONS */')) {
  const start = code.indexOf('H(`section`,jg,['), end = code.indexOf('r.result.history.length?', start);
  if (start < 0 || end < 0) throw new Error('Native search panel not found');
  let panel = code.slice(start, end);
  const opening = 'H(`div`,Pg,[';
  const ending = ':G(``,!0)]),';
  if (!panel.includes(opening) || !panel.endsWith(ending)) throw new Error('Native search panel layout changed');
  panel = panel.replace(opening, '/* UX_SEARCH_OPTIONS */H(`details`,{class:`ux-native-search-options`},[H(`summary`,null,[H(`span`,null,`検索条件・対象の調整`),H(`span`,{class:`ux-search-scope`},A(r.BUSINESSES.find(e=>e.key===r.business)?.label||`すべて`)+(r.asOf?` ／ `+r.formatYmd(r.asOf):``))]),' + opening);
  panel = panel.slice(0, -ending.length) + ':G(``,!0)])]),';
  code = code.slice(0, start) + panel + code.slice(end);
  code = code.replace('H(`section`,Zg,[', 'H(`details`,{...Zg,class:`ux-term-history`},[H(`summary`,null,`過去の改正での出現・削除を確認`),');
}
// Focus the visible primary navigation rather than the superseded hidden list.
code = code.replace('n.value?.querySelector(`a`)?.focus()', 'n.value?.querySelector(`.ux-nav-primary`)?.focus()');
// Keep the native full-text search, document tree and record management usable.
code = code.replace('!e.searchQuery?U(researchViews.Home)', '!e.searchQuery&&e.$route.path===`/`?U(researchViews.Home)');
code = code.replace('"show-search":r.route.name!==`index`', '"show-search":![`index`,`research-library`].includes(r.route.name)');
if (!code.includes('/* UX_DATA_TOOLS */')) code = code.replace('H(`section`,y_,[', '/* UX_DATA_TOOLS */H(`details`,y_,[H(`summary`,{class:`ux-data-summary`},`記録のバックアップ・データ管理`),');
// Include relationships in the same IndexedDB document store and record backups.
if (!code.includes('researchMappings:e.researchMappings||[]')) {
  code = code.replace('regulations:e.regulations||[],prefs:t', 'regulations:e.regulations||[],researchMappings:e.researchMappings||[],prefs:t');
  code = code.replace('regulations:(e.regulations||[]).length},r=[]', 'regulations:(e.regulations||[]).length,researchMappings:(e.researchMappings||[]).filter(e=>!e.deleted).length},r=[]');
  code = code.replace('[[`lists`,e.lists],[nh,e.regulations]]', '[[`lists`,e.lists],[nh,e.regulations],[`researchMappings`,e.researchMappings]]');
  code = code.replace('社内規程 ${a.regulations}件`', '社内規程 ${a.regulations}件・資料の対応づけ ${a.researchMappings||0}件`');
  code = code.replaceAll('対応状況・社内規程・社内の対応・コメント・リスト', '対応状況・社内規程・社内の対応・コメント・リスト・資料の対応づけ');
}
code = code.replace(/format:ch,version:[12],exportedAt:/, 'format:ch,version:3,exportedAt:');
code = code.replace(/if\(e.version>[12]\)return\{ok:!1,error:`より新しい形式のファイルです/, 'if(e.version>3)return{ok:!1,error:`より新しい形式のファイルです');
if (!code.includes('researchImpactReviews:e.researchImpactReviews||[]')) {
  code = code.replace('researchMappings:e.researchMappings||[],prefs:t', 'researchMappings:e.researchMappings||[],researchImpactReviews:e.researchImpactReviews||[],prefs:t');
  code = code.replace('researchMappings:(e.researchMappings||[]).filter(e=>!e.deleted).length},r=[]', 'researchMappings:(e.researchMappings||[]).filter(e=>!e.deleted).length,researchImpactReviews:(e.researchImpactReviews||[]).filter(e=>!e.deleted).length},r=[]');
  code = code.replace('[`researchMappings`,e.researchMappings]]', '[`researchMappings`,e.researchMappings],[`researchImpactReviews`,e.researchImpactReviews]]');
  code = code.replace('資料の対応づけ ${a.researchMappings||0}件`', '資料の対応づけ ${a.researchMappings||0}件・改正の確認 ${a.researchImpactReviews||0}件`');
  code = code.replaceAll('リスト・資料の対応づけ', 'リスト・資料の対応づけ・改正の確認');
}
code = code.replace(/format:ch,version:[123],exportedAt:/, 'format:ch,version:4,exportedAt:');
code = code.replace('if(e.version>3)return', 'if(e.version>4)return');
if (!code.includes('researchReport:e.researchReport||[]')) {
  code = code.replace('researchImpactReviews:e.researchImpactReviews||[],prefs:t', 'researchImpactReviews:e.researchImpactReviews||[],researchReport:e.researchReport||[],prefs:t');
  code = code.replace('researchImpactReviews:(e.researchImpactReviews||[]).filter(e=>!e.deleted).length},r=[]', 'researchImpactReviews:(e.researchImpactReviews||[]).filter(e=>!e.deleted).length,researchReport:(e.researchReport||[]).filter(e=>!e.deleted).length},r=[]');
  code = code.replace('[`researchImpactReviews`,e.researchImpactReviews]]', '[`researchImpactReviews`,e.researchImpactReviews],[`researchReport`,e.researchReport]]');
  code = code.replace('改正の確認 ${a.researchImpactReviews||0}件`', '改正の確認 ${a.researchImpactReviews||0}件・調査レポート ${a.researchReport||0}件`');
  code = code.replaceAll('リスト・資料の対応づけ・改正の確認', 'リスト・資料の対応づけ・改正の確認・調査レポート');
}
for (const anchor of ['researchReport:e.researchReport||[],prefs:t', '[`researchMappings`,e.researchMappings]', 'U(researchViews.Nav)', '/* RESEARCH_ROUTES_START */']) {
  if (!code.includes(anchor)) throw new Error(`Feature integration incomplete: ${anchor}`);
}
code = code.replace(/(?:・資料の対応づけ){2,}/g, '・資料の対応づけ');
code = code.replace(/mm=`[^`]+`/, 'mm=`__DATA_VERSION__`');
code = code.replace('mm=`__DATA_VERSION__`', `mm=\`${hash(code).slice(0, 16)}\``);
const entry = asset('index', code);
html = html.replace(`/assets/${previous}`, `/assets/${entry}`);
if (previousCss) html = html.replace(`/assets/${previousCss}`, `/assets/${css}`);
else html = html.replace('</head>', `  <link rel="stylesheet" href="/assets/${css}">\n</head>`);
writeFileSync(resolve(root, 'index.html'), html);
const keep = new Set([entry, view, css, historyData, ...packed.values()]);
for (const old of [previous, previousCss, ...oldModules]) {
  if (old && !keep.has(old) && existsSync(resolve(root, 'assets', old))) unlinkSync(resolve(root, 'assets', old));
}
console.log(`Built research, historical comparisons, revision impacts and service filters: ${entry}`);
