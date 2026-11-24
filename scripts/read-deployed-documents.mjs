import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import vm from 'node:vm';
export async function readDeployedDocuments(root) {
  const html = readFileSync(resolve(root,'index.html'),'utf8');
  const name = html.match(/src="\/assets\/(index-[^"/]+\.js)"/)[1];
  const code = readFileSync(resolve(root,'assets',name),'utf8');
  const data = code.match(/import sbivcDocuments from "\.\/([^"/]+)"/)[1];
  const { default: sbivcDocuments } = await import(pathToFileURL(resolve(root,'assets',data)));
  const start = code.indexOf('Rd={') + 3;
  let depth = 0, quote = null, end;
  for (let i=start;i<code.length;i++) {
    const char=code[i];
    if (quote) { if(char==='\\')i++;else if(char===quote)quote=null; }
    else if ('"\'`'.includes(char))quote=char;
    else if(char==='{')depth++;
    else if(char==='}' && --depth===0) {end=i+1;break;}
  }
  if (!end || start<3) throw new Error('Published registry not found');
  return JSON.parse(JSON.stringify(vm.runInNewContext(`(${code.slice(start,end)})`,{sbivcDocuments})));
}
