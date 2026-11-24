import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import { defaultQuote, validateQuote, quoteLength, sharedDocumentUrl, sourceArticleUrl, shareText, wrapText, SHARE_ORIGIN, MAX_QUOTE } from '../features/share-model.mjs';
import { readDeployedDocuments } from './read-deployed-documents.mjs';
import { publishedDocuments } from '../features/share-public-docs.mjs';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const source='第一の文です。\n次の文は、括弧（条件）を含みます。';
assert.equal(validateQuote('次の文は、括弧（条件）を含みます。',source),'');
assert(validateQuote('第一の文です。含みます。',source));
assert(validateQuote('書き換えた文章',source));assert(validateQuote('',source));
assert.equal(quoteLength('漢字😀'),3);assert(validateQuote('あ'.repeat(MAX_QUOTE+1),'あ'.repeat(MAX_QUOTE+1)));
assert.equal(defaultQuote('短い文。'),'短い文。');assert(quoteLength(defaultQuote('あ'.repeat(1000)))<=220);
assert(!validateQuote(defaultQuote(source),source));
const target=new URL(sharedDocumentUrl('mercoin_tos','mc-tos-1-1','2026-10-06'));
assert.equal(target.origin,SHARE_ORIGIN);assert.equal(target.searchParams.get('item'),'mc-tos-1-1');assert.equal(target.searchParams.get('asof'),'2026-10-06');
assert(!sharedDocumentUrl('a','b').includes('quote='));
assert(sourceArticleUrl('a/b','x/y').includes('a%2Fb/x%2Fy'));
const caption=shareText({title:'公表資料',index:'第1条',fetchedAt:'2026-10-06',url:target.href,owner:'社内担当',note:'内部メモ'},'引用');
assert(caption.includes(target.href));assert(!caption.includes('内部メモ'));assert(!caption.includes('社内担当'));
assert(wrapText('あいうえお。かき',x=>x.length,5).every(line=>!line.startsWith('。')));
assert.deepEqual(wrapText('一\n二',x=>x.length,10),['一','二']);
const documents=await readDeployedDocuments(root);
const docIds=Object.entries(documents).filter(([,doc])=>doc && !Array.isArray(doc) && doc.displayName && (doc.tweets || doc.questions)).map(([id])=>id);
assert.deepEqual([...publishedDocuments].sort(),docIds.sort());
function png(path,width,height) { const image=readFileSync(path); assert.equal(image.subarray(0,8).toString('hex'),'89504e470d0a1a0a');assert.equal(image.readUInt32BE(16),width);assert.equal(image.readUInt32BE(20),height); }
for(const id of docIds) {
 const path=resolve(root,'share',id,'index.html'),html=readFileSync(path,'utf8');
 assert(html.includes('property="og:title"'));assert(html.includes('property="og:image"'));assert(html.includes('name="twitter:card" content="summary_large_image"'));
 assert(html.includes('src="/share/reader.js"'));assert(!html.includes('http-equiv="refresh"'));
 assert(html.indexOf('property="og:title"') < html.indexOf('<script'));
 png(resolve(root,'share',id,'cover.png'),1200,630);
}
png(resolve(root,'share/cover.png'),1200,630);
const home=readFileSync(resolve(root,'index.html'),'utf8');assert(home.includes('SHARE_METADATA_START'));assert(home.includes("img-src 'self' data: blob: https:"));assert(home.includes(`${SHARE_ORIGIN}/share/cover.png`));
const entry=readFileSync(resolve(root,'assets',home.match(/src="\/assets\/(index-[^"/]+\.js)"/)[1]),'utf8');assert(entry.includes('/* QUOTE_SHARE */'));assert(entry.includes('content:r.document.public_comment?void 0:r.contentHtml'));assert(entry.includes('asOf:r.asOfDate'));
const bridge=readFileSync(resolve(root,'share/reader.js'),'utf8');
function redirect(query){let destination,href;const context={URL,URLSearchParams,document:{querySelector:selector=>selector==='[data-document]'?{dataset:{document:'mercoin_tos',items:JSON.stringify(['mc-tos-1-1'])}}:{set href(value){href=value;}}},location:{search:query,origin:'https://test.invalid',replace:value=>{destination=value;}}};vm.runInNewContext(bridge,context);assert.equal(destination,href);return new URL(destination);}
assert.equal(redirect('?item=mc-tos-1-1&asof=2026-10-06').pathname,'/document/mercoin_tos/mc-tos-1-1');
assert.equal(redirect('?item=mc-tos-1-1&asof=2026-10-06').searchParams.get('asof'),'2026-10-06');
assert.equal(redirect('?item=../../private&url=https://evil.invalid&quote=secret').href,'https://test.invalid/document/mercoin_tos');
assert(!redirect('?asof=2026-02-31').searchParams.has('asof'));
console.log(`PASS: exact excerpts and length/layout validation; public-only clipboard captions; ${docIds.length} static OGP pages and PNG covers; native historical-version integration; safe article redirects.`);
