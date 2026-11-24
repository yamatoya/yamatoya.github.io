import { readFileSync, writeFileSync, mkdirSync, existsSync, unlinkSync, mkdtempSync, rmSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
import { readDeployedDocuments } from './read-deployed-documents.mjs';
import { SHARE_ORIGIN, sharedDocumentUrl } from '../features/share-model.mjs';
import { escapeHtml } from '../features/report-model.mjs';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..'),directory=resolve(root,'share');
const documents=await readDeployedDocuments(root);
const text=value=>String(value||'').replace(/<br\s*\/?>/gi,' ').replace(/<[^>]+>/g,'').replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').trim();
const rows=Object.entries(documents).filter(([,doc])=>doc && !Array.isArray(doc) && doc.displayName && (doc.tweets || doc.questions));
const generated=[], covers=[];
mkdirSync(directory,{recursive:true});
function page(docId,doc) {
  const title=text(doc.displayName),category=doc.company?.name|| (doc.law?'法令':doc.jvcea?'自主規制規則':doc.public_comment?'パブリックコメント':'公表資料・参考資料');
  const url=sharedDocumentUrl(docId),folder=resolve(directory,docId);
  if(dirname(folder)!==directory)throw new Error('Invalid document ID');
  mkdirSync(folder,{recursive:true});
  const description=`${title}の収録本文と出典を確認できます。`;
  const image=`${url}cover.png`,target=`${SHARE_ORIGIN}/document/${encodeURIComponent(docId)}`;
  const items=(doc.public_comment?doc.questions:doc.tweets||[]).filter(item=>item.id).map(item=>item.id);
  const e=escapeHtml;
  const html=`<!doctype html><html lang="ja"><head><meta charset="utf-8"><title>${e(title)} | 法令・ガイドライン ビューア</title>
<meta name="description" content="${e(description)}"><meta property="og:type" content="article"><meta property="og:locale" content="ja_JP"><meta property="og:site_name" content="法令・ガイドライン ビューア"><meta property="og:title" content="${e(title)}"><meta property="og:description" content="${e(description)}"><meta property="og:url" content="${e(url)}"><meta property="og:image" content="${e(image)}"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta property="og:image:alt" content="${e(title)}の文書カード"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${e(title)}"><meta name="twitter:description" content="${e(description)}"><meta name="twitter:image" content="${e(image)}"><link rel="canonical" href="${e(target)}"><meta name="viewport" content="width=device-width"><meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self'; style-src 'self'; object-src 'none'; base-uri 'none'"><link rel="stylesheet" href="/share/reader.css"><script src="/share/reader.js" defer></script></head><body><main data-document="${e(docId)}" data-items="${e(JSON.stringify(items))}"><p>法令・ガイドライン ビューア</p><h1>${e(title)}</h1><p>${e(description)}</p><img src="${e('/share/'+encodeURIComponent(docId)+'/cover.png')}" alt="${e(title)}の文書カード" width="1200" height="630"><p><a id="read-document" href="${e(target)}">収録本文を読む</a></p></main></body></html>\n`;
  writeFileSync(join(folder,'index.html'),html);generated.push(`${docId}/index.html`,`${docId}/cover.png`);
  covers.push({title,category,file:join(folder,'cover.png')});
}
for(const [id,doc] of rows)page(id,doc);
covers.push({title:'根拠を読み、対応を考える。',category:'法令・公表資料の調査ワークスペース',file:join(directory,'cover.png')});generated.push('cover.png');
const temp=mkdtempSync(join(tmpdir(),'share-covers-'));
try {
 const file=join(temp,'covers.json');writeFileSync(file,JSON.stringify(covers));
 const python=process.env.SHARE_PYTHON||'python3';
 const run=spawnSync(python,[resolve(root,'scripts/render-share-covers.py'),file],{encoding:'utf8'});
 if(run.status!==0)throw new Error(run.stderr||run.stdout);
 console.log(run.stdout.trim());
} finally {rmSync(temp,{recursive:true,force:true});}
writeFileSync(resolve(root,'features/share-public-docs.mjs'),`// Generated from the published registry only; never from browser records.\nexport const publishedDocuments = new Set(${JSON.stringify(rows.map(([id])=>id).sort())});\n`);
const manifest=join(directory,'generated.json');
if(existsSync(manifest))for(const old of JSON.parse(readFileSync(manifest,'utf8')).files)if(!generated.includes(old)) {
 const path=resolve(directory,old);if(path.startsWith(directory+'/')&&existsSync(path))unlinkSync(path);
}
writeFileSync(manifest,JSON.stringify({documents:rows.length,files:generated.sort()},null,2)+'\n');
let html=readFileSync(resolve(root,'index.html'),'utf8');
const metadata=`<!-- SHARE_METADATA_START -->\n<meta name="description" content="法令・自主規制規則と事業者の公表資料を調べ、比較し、判断の根拠を残すワークスペース。"><meta property="og:type" content="website"><meta property="og:locale" content="ja_JP"><meta property="og:title" content="法令・ガイドライン ビューア"><meta property="og:description" content="根拠を読み、対応を考える。法令・公表資料の調査と比較をひとつに。"><meta property="og:url" content="${SHARE_ORIGIN}/"><meta property="og:image" content="${SHARE_ORIGIN}/share/cover.png"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta property="og:image:alt" content="法令・ガイドライン ビューアの共有カード"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:image" content="${SHARE_ORIGIN}/share/cover.png">\n<!-- SHARE_METADATA_END -->`;
if(html.includes('<!-- SHARE_METADATA_START -->'))html=html.replace(/<!-- SHARE_METADATA_START -->[\s\S]*?<!-- SHARE_METADATA_END -->/,metadata);else html=html.replace('<title>',metadata+'\n<title>');
html=html.replace("img-src 'self' data: https:","img-src 'self' data: blob: https:");
writeFileSync(resolve(root,'index.html'),html);
console.log(`Generated ${rows.length} public document pages with static OGP metadata.`);
