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
const model = asset('research-model', readFileSync(resolve(root, 'features/research-model.mjs'), 'utf8'));
const view = asset('research-views', readFileSync(resolve(root, 'features/research-views.mjs'), 'utf8').replace("'./research-model.mjs'", `"./${model}"`));
const css = asset('research', readFileSync(resolve(root, 'features/research.css'), 'utf8'), 'css');
let html = readFileSync(resolve(root, 'index.html'), 'utf8');
const previous = html.match(/src="\/assets\/(index-[^"/]+\.js)"/)[1];
let code = readFileSync(resolve(root, 'assets', previous), 'utf8');
const previousView = code.match(/import \{ createResearchViews \} from "\.\/(research-views-[a-f0-9]+\.js)";/)?.[1];
const previousModel = previousView && readFileSync(resolve(root, 'assets', previousView), 'utf8').match(/\.\/(research-model-[a-f0-9]+\.js)/)?.[1];
const previousCss = html.match(/href="\/assets\/(research-[a-f0-9]+\.css)"/)?.[1];
code = code.replace(/^import \{ createResearchViews \} from [^;]+;\n/m, '');
const firstLine = code.indexOf('\n') + 1;
code = code.slice(0, firstLine) + `import { createResearchViews } from "./${view}";\n` + code.slice(firstLine);
const factory = '/* RESEARCH_VIEWS_START */var researchViews=createResearchViews({h:U,ref:N,computed:K,watch:zn,nextTick:Sn,useRoute:ns,useRouter:ts,loadDocuments:tl,updateDocuments:nl,dataKey:()=>Z.getItem(X),toText:e=>Kl(e,` `),sanitize:am,persistent:()=>Z.persistent});/* RESEARCH_VIEWS_END */';
if (code.includes('/* RESEARCH_VIEWS_START */')) code = code.replace(/\/\* RESEARCH_VIEWS_START \*\/[\s\S]*?\/\* RESEARCH_VIEWS_END \*\//, factory);
else {
  if (!code.includes('var EN=zc(')) throw new Error('Router initialization not found');
  code = code.replace('var EN=zc(', factory + 'var EN=zc(');
}
const routes = '/* RESEARCH_ROUTES_START */{path:`/topics`,component:researchViews.Topics,name:`research-topics`},{path:`/topics/:topicId`,component:researchViews.Topics,name:`research-topic-detail`},{path:`/provider-compare`,component:researchViews.Compare,name:`research-compare`},{path:`/regulation-map`,component:researchViews.Mapping,name:`research-mapping`},/* RESEARCH_ROUTES_END */';
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
// Include relationships in the same IndexedDB document store and record backups.
if (!code.includes('researchMappings:e.researchMappings||[],prefs:t')) {
  code = code.replace('regulations:e.regulations||[],prefs:t', 'regulations:e.regulations||[],researchMappings:e.researchMappings||[],prefs:t');
  code = code.replace('regulations:(e.regulations||[]).length},r=[]', 'regulations:(e.regulations||[]).length,researchMappings:(e.researchMappings||[]).filter(e=>!e.deleted).length},r=[]');
  code = code.replace('[[`lists`,e.lists],[nh,e.regulations]]', '[[`lists`,e.lists],[nh,e.regulations],[`researchMappings`,e.researchMappings]]');
  code = code.replace('社内規程 ${a.regulations}件`', '社内規程 ${a.regulations}件・資料の対応づけ ${a.researchMappings||0}件`');
  code = code.replaceAll('対応状況・社内規程・社内の対応・コメント・リスト', '対応状況・社内規程・社内の対応・コメント・リスト・資料の対応づけ');
}
code = code.replace('format:ch,version:1,exportedAt:', 'format:ch,version:2,exportedAt:');
code = code.replace('if(e.version>1)return{ok:!1,error:`より新しい形式のファイルです', 'if(e.version>2)return{ok:!1,error:`より新しい形式のファイルです');
for (const anchor of ['researchMappings:e.researchMappings||[],prefs:t', '[`researchMappings`,e.researchMappings]', 'U(researchViews.Nav)', '/* RESEARCH_ROUTES_START */']) {
  if (!code.includes(anchor)) throw new Error(`Feature integration incomplete: ${anchor}`);
}
code = code.replace(/mm=`[^`]+`/, 'mm=`__DATA_VERSION__`');
code = code.replace('mm=`__DATA_VERSION__`', `mm=\`${hash(code).slice(0, 16)}\``);
const entry = asset('index', code);
html = html.replace(`/assets/${previous}`, `/assets/${entry}`);
if (previousCss) html = html.replace(`/assets/${previousCss}`, `/assets/${css}`);
else html = html.replace('</head>', `  <link rel="stylesheet" href="/assets/${css}">\n</head>`);
writeFileSync(resolve(root, 'index.html'), html);
for (const [old, next] of [[previous, entry], [previousView, view], [previousModel, model], [previousCss, css]]) {
  if (old && old !== next && existsSync(resolve(root, 'assets', old))) unlinkSync(resolve(root, 'assets', old));
}
console.log(`Built topic research, provider comparison and regulation map: ${entry}`);
