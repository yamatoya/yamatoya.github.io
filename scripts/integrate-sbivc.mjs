// Wire the generated document module into this deployment-only checkout.
// Run after import-sbivc.py; does not require the original application build.
import { readFileSync, writeFileSync, unlinkSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const hash = text => createHash('sha256').update(text).digest('hex');
const report = JSON.parse(readFileSync(resolve(root, 'docs/sbivc/2026-11-21/import-report.json'), 'utf8'));
let html = readFileSync(resolve(root, 'index.html'), 'utf8');
const entry = html.match(/src="\/assets\/(index-[^"/]+\.js)"/)?.[1];
if (!entry) throw new Error('Expected a single deployed application entry');
let code = readFileSync(resolve(root, 'assets', entry), 'utf8');
const previousModule = code.match(/^import sbivcDocuments from "\.\/(sbivc-documents-[a-f0-9]+\.js)";/)?.[1];
code = code.replace(/^import sbivcDocuments from [^;]+;\n/, '');
if (!code.includes('Rd={...sbivcDocuments,crypto_guidelines:')) {
  if (!code.includes('Rd={crypto_guidelines:')) throw new Error('Bundled document registry not found');
  code = code.replace('Rd={crypto_guidelines:', 'Rd={...sbivcDocuments,crypto_guidelines:');
}
code = `import sbivcDocuments from "./${report.asset}";\n` + code;
code = code.replace('label:`自社の公表資料（メルコイン）`', 'label:`事業者の公表資料`');
code = code.replace('法律・共通の規則・マネロンの FAQ・自社の資料など', '法律・共通の規則・マネロンの FAQ・事業者の公表資料など');
// Keep company names visible when multiple providers share this category.
code = code.replace('case`company`:return t.replace(/^メルコイン\\s*/,``)', 'case`company`:return t');
if (!code.includes('label:`事業者の公表資料`') || !code.includes('case`company`:return t;')) {
  throw new Error('Company document presentation did not match the expected application');
}
// Startup skips merging if this version is unchanged. Bump it with the content
// so returning users also receive the new documents without resetting edits.
if (!/mm=`[^`]+`/.test(code)) throw new Error('Bundled data version not found');
code = code.replace(/mm=`[^`]+`/, 'mm=`__DATA_VERSION__`');
code = code.replace('mm=`__DATA_VERSION__`', `mm=\`${hash(code).slice(0, 16)}\``);
const nextEntry = `index-${hash(code).slice(0, 12)}.js`;
writeFileSync(resolve(root, 'assets', nextEntry), code);
html = html.replace(`/assets/${entry}`, `/assets/${nextEntry}`);
writeFileSync(resolve(root, 'index.html'), html);
if (entry !== nextEntry) unlinkSync(resolve(root, 'assets', entry));
if (previousModule && previousModule !== report.asset) unlinkSync(resolve(root, 'assets', previousModule));
console.log(`Integrated ${report.documents.length} SBI VC Trade documents into ${nextEntry}`);
