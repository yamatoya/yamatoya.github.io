export const SHARE_ORIGIN = 'https://yamatoya.github.io';
export const MAX_QUOTE = 480;
export const quoteLength = text => Array.from(text || '').length;
export const comparable = text => String(text || '').normalize('NFC').replace(/\s+/g,'').trim();
export function defaultQuote(text, maximum = 220) {
  const chars = Array.from(String(text || '').trim());
  if (chars.length <= maximum) return chars.join('');
  const head = chars.slice(0,maximum).join(''), stop = Math.max(head.lastIndexOf('。'),head.lastIndexOf('\n'));
  return stop > maximum * .45 ? head.slice(0,stop+1).trim() : head.trim();
}
export function validateQuote(quote, source) {
  if (!String(quote || '').trim()) return '共有する抜粋を選んでください。';
  if (quoteLength(quote) > MAX_QUOTE) return `${MAX_QUOTE}文字以内の一節を選んでください。長い文章はリンク先で確認できます。`;
  if (!comparable(source).includes(comparable(quote))) return '引用元に連続して含まれる一節を選んでください。文言の書き換えや離れた箇所の結合はできません。';
  return '';
}
export function sharedDocumentUrl(docId,itemId='',asOf='') {
  const url = new URL(`/share/${encodeURIComponent(docId)}/`,SHARE_ORIGIN);
  if(itemId) url.searchParams.set('item',itemId);
  if(/^\d{4}-\d{2}-\d{2}$/.test(asOf)) url.searchParams.set('asof',asOf);
  return url.href;
}
export function sourceArticleUrl(docId,itemId='',asOf='') {
  const url=new URL(`/document/${encodeURIComponent(docId)}${itemId?'/'+encodeURIComponent(itemId):''}`,SHARE_ORIGIN);
  if(/^\d{4}-\d{2}-\d{2}$/.test(asOf)) url.searchParams.set('asof',asOf);
  return url.href;
}
export function shareText(record,quote) {
  const lines = [quote.trim(), `— ${record.title} ／ ${record.index || '本文'}（抜粋${record.asOf?'・'+record.asOf+'時点':''}）`];
  if(record.fetchedAt) lines.push(`資料取得日 ${record.fetchedAt}`);
  lines.push(record.url); return lines.join('\n\n');
}
// Use a supplied measurement function so the same layout can be tested without
// a browser. Avoid a closing punctuation mark starting the next line.
export function wrapText(text,measure,width) {
  const lines=[]; let current='';
  for(const char of Array.from(String(text || ''))) {
    if(char==='\n') {lines.push(current);current='';continue;}
    if(current && measure(current+char)>width && !/[、。，．！？!?,.：:；;）)」』】〕〉》]/u.test(char)) {lines.push(current);current=char;}
    else current+=char;
  }
  if(current || !lines.length)lines.push(current);
  return lines;
}
export async function renderQuoteCard(record,quote,{marker=true}={}) {
  const canvas=document.createElement('canvas'),ctx=canvas.getContext('2d');
  if(!ctx)throw new Error('画像を作成できませんでした。');
  await document.fonts.ready;
  const font='"Hiragino Sans", "Yu Gothic", "Noto Sans JP", sans-serif';
  ctx.font=`400 35px ${font}`;
  const lines=wrapText(quote.trim(),text=>ctx.measureText(text).width,1032);
  ctx.font=`600 25px ${font}`;
  const titleLines=wrapText(record.title,text=>ctx.measureText(text).width,1020);
  canvas.width=1200;canvas.height=Math.max(720,220+lines.length*58+Math.min(titleLines.length,3)*38+180);
  ctx.fillStyle=marker?'#fbfaf5':'#ffffff';ctx.fillRect(0,0,canvas.width,canvas.height);
  ctx.fillStyle='#25596d';ctx.fillRect(0,0,1200,10);
  ctx.font=`600 19px ${font}`;ctx.fillStyle='#25596d';ctx.fillText('法令・ガイドライン ビューア',80,66);
  ctx.font=`400 17px ${font}`;ctx.fillStyle='#677a82';ctx.textAlign='right';ctx.fillText('引用・抜粋',1120,66);ctx.textAlign='left';
  const footer=canvas.height- Math.min(titleLines.length,3)*38 - 132;
  let y=Math.max(206,Math.round((180+footer-60-((lines.length-1)*58+42))/2)+30);
  ctx.font='90px Georgia,serif';ctx.fillStyle=marker?'#d8c17b':'#becdd2';ctx.fillText('“',73,y-42);
  ctx.font=`400 35px ${font}`;
  for(const line of lines) {
    if(marker && line.trim()) {ctx.fillStyle='#f5e5a8';ctx.fillRect(80,y-25,Math.min(1040,ctx.measureText(line).width+9),36);}
    ctx.fillStyle='#24333f';ctx.fillText(line,84,y);y+=58;
  }
  ctx.strokeStyle='#d8dfdd';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(80,footer-30);ctx.lineTo(1120,footer-30);ctx.stroke();
  ctx.font=`600 25px ${font}`;ctx.fillStyle='#24333f';
  titleLines.slice(0,3).forEach((line,index)=>ctx.fillText(index===2&&titleLines.length>3?line.slice(0,-1)+'…':line,80,footer+index*38));
  const metaY=footer+Math.min(titleLines.length,3)*38+12;
  ctx.font=`400 20px ${font}`;ctx.fillStyle='#526873';
  const indexLines=wrapText(record.index||'本文',text=>ctx.measureText(text).width,1000);
  ctx.fillText(indexLines[0]+(indexLines.length>1?'…':''),80,metaY);
  ctx.font=`400 17px ${font}`;ctx.fillStyle='#677a82';ctx.fillText(record.asOf?`${record.asOf} 時点の収録本文` : record.fetchedAt?`資料取得日 ${record.fetchedAt}`:'収録本文の一部を抜粋',80,metaY+36);
  ctx.textAlign='right';ctx.fillText('yamatoya.github.io',1120,canvas.height-36);ctx.textAlign='left';
  const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));
  if(!blob)throw new Error('PNG画像を作成できませんでした。');
  return blob;
}
