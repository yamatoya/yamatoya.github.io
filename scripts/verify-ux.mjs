import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { WORKSPACES, workspaceFor, activeFilters } from '../features/ux-model.mjs';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
assert.equal(WORKSPACES.length, 4);
for (const group of WORKSPACES) for (const [path] of group.links) assert.equal(workspaceFor(path)?.id, group.id);
// Existing deep links must land in the appropriate workspace as well.
for (const [path, group] of [['/document/mercoin_tos/mc-tos-1-1','sources'],['/compare/crypto_guidelines/one','compare'],['/revisions/crypto_guidelines/20260918','review'],['/checklist/crypto_guidelines','review'],['/lists/example/edit','reports']]) assert.equal(workspaceFor(path)?.id, group, path);
assert.equal(workspaceFor('/'), null); assert.equal(workspaceFor('/', { q: '分別管理' }).id, 'sources');
assert.deepEqual(activeFilters({ provider: 'メルコイン', service: 'spot', common: '0', event: 'record', l: 'source', q: '' }), ['provider','service','common']);
const html = readFileSync(resolve(root, 'index.html'), 'utf8');
const entry = html.match(/src="\/assets\/([^"/]+\.js)"/)[1], code = readFileSync(resolve(root, 'assets', entry), 'utf8');
for (const route of ['/library','/compare','/review','/compare/:documentId/:tweetId','/document/:documentId/:tweetId','/revisions/:documentId/:revisionId']) assert(code.includes(`path:\`${route}\``), route);
assert(code.includes('U(researchViews.LibraryHeader)'));
assert(code.includes('!e.searchQuery&&e.$route.path===`/`?U(researchViews.Home)'));
assert(code.includes('/* UX_SEARCH_OPTIONS */'));
assert(code.includes('/* UX_DATA_TOOLS */'));
// Validate the full delivered module graph, including new UX modules and all
// historical/report dependencies, rather than allowing stale hashed imports.
const checked = new Set();
function inspect(file) {
  if (checked.has(file)) return; checked.add(file);
  assert(existsSync(resolve(root,'assets',file)), file);
  const source = readFileSync(resolve(root,'assets',file),'utf8');
  for (const match of source.matchAll(/from ["']\.\/([^"']+\.js)["']/g)) inspect(match[1]);
}
inspect(entry);
console.log(`PASS: task-based navigation, legacy deep links/search/backup controls and ${checked.size} deployable modules.`);
