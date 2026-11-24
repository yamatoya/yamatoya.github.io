import { defaultQuote, validateQuote, MAX_QUOTE, quoteLength, sharedDocumentUrl, shareText, renderQuoteCard } from './share-model.mjs';
import { publishedDocuments } from './share-public-docs.mjs';
export function createShareViews(api,ui) {
 const {ref,computed,watch,nextTick,toText}=api; const {h}=ui;
 const ShareQuote={name:'QuoteShare',props:{row:Object,doc:Object,item:Object,docId:String,itemId:String,content:String,asOf:String,exists:{type:Boolean,default:true}},setup(props){
  const opened=ref(false),quote=ref(''),marker=ref(true),preview=ref(''),blob=ref(null),message=ref(''),busy=ref(false),dialog=ref(null),trigger=ref(null);
  let timer,generation=0;
  const record=computed(()=>{
   const row=props.row,doc=row?.doc||props.doc||{},item=row?.item||props.item||{};
   const docId=row?.docId||props.docId,itemId=item.id||props.itemId;
   const text=toText(props.content ?? row?.content ?? (doc.public_comment?`【質問】${item.question||''}\n【回答】${item.answer||''}`:item.content||'')).trim();
   return {title:toText(doc.displayName||'収録資料'),index:toText(item.index||'本文'),docId,itemId,text,asOf:props.asOf||'',fetchedAt:doc.company?.fetchedAt||doc.source?.fetchedAt||'',public:publishedDocuments.has(docId),url:publishedDocuments.has(docId)?sharedDocumentUrl(docId,itemId,props.asOf):''};
  });
  const error=computed(()=>validateQuote(quote.value,record.value.text));
  const cleanup=()=>{clearTimeout(timer);generation++;if(preview.value)URL.revokeObjectURL(preview.value);preview.value='';blob.value=null;busy.value=false;};
  const close=()=>{dialog.value?.close();opened.value=false;cleanup();trigger.value?.focus();};
  const render=async()=>{
   const version=++generation;blob.value=null;
   if(error.value){if(preview.value)URL.revokeObjectURL(preview.value);preview.value='';busy.value=false;return;}
   busy.value=true;
   try{const result=await renderQuoteCard(record.value,quote.value,{marker:marker.value});if(version!==generation||!opened.value)return;if(preview.value)URL.revokeObjectURL(preview.value);blob.value=result;preview.value=URL.createObjectURL(result);}catch(error){if(version===generation)message.value=error.message;}finally{if(version===generation)busy.value=false;}
  };
  const open=async()=>{
   const selected=window.getSelection();let excerpt='';
   const region=trigger.value?.closest('.tweet-container,.research-evidence');
   if(selected && selected.rangeCount && region && region.contains(selected.anchorNode) && region.contains(selected.focusNode)) {
     const candidate=selected.toString().trim();if(candidate && !validateQuote(candidate,record.value.text))excerpt=candidate;
   }
   cleanup();quote.value=excerpt||defaultQuote(record.value.text);message.value='';opened.value=true;
   await nextTick();clearTimeout(timer);dialog.value?.showModal();await render();
  };
  watch(()=>[quote.value,marker.value],()=>{if(!opened.value)return;clearTimeout(timer);generation++;blob.value=null;timer=setTimeout(render,160);});
  watch(()=>[props.docId,props.itemId,props.asOf,props.row?.item.id,props.content,props.row?.content],()=>{if(opened.value)close();});
  const filename=()=>`quote-${String(record.value.docId||'document').replace(/[^\w-]/g,'-')}-${String(record.value.itemId||'excerpt').replace(/[^\w-]/g,'-')}.png`;
  const download=()=>{if(!blob.value)return;const url=URL.createObjectURL(blob.value),anchor=document.createElement('a');anchor.href=url;anchor.download=filename();anchor.click();setTimeout(()=>URL.revokeObjectURL(url),1000);message.value='PNGを保存しました。リンク付き引用もコピーして、画像と一緒に貼り付けられます。';};
  const copyImage=async()=>{try{if(!blob.value)throw new Error('画像の準備ができていません。');await navigator.clipboard.write([new ClipboardItem({'image/png':blob.value})]);message.value='画像をコピーしました。Slackなどの入力欄に貼り付けられます。';}catch{message.value='この環境では画像をコピーできませんでした。「PNGを保存」をご利用ください。';}};
  const copyCitation=async()=>{try{if(error.value)throw new Error();await navigator.clipboard.writeText(shareText(record.value,quote.value));message.value='引用とリンクをコピーしました。';}catch{message.value='コピーできませんでした。下の「リンク付き引用」を選択してコピーしてください。';}};
  const copyUrl=async()=>{try{await navigator.clipboard.writeText(record.value.url);message.value='文書のプレビュー付きリンクをコピーしました。';}catch{message.value='コピーできませんでした。下のリンクを選択してコピーしてください。';}};
  const fileShare=async()=>{try{const file=new File([blob.value],filename(),{type:'image/png'});if(!navigator.canShare?.({files:[file]})){message.value='この端末ではファイル共有に対応していません。PNGを保存してご利用ください。';return;}await navigator.share({files:[file],title:record.value.title,text:shareText(record.value,quote.value)});}catch(error){if(error.name!=='AbortError')message.value='共有できませんでした。PNGを保存してご利用ください。';}};
  const action=(label,fn,disabled=false,primary=false)=>h('button',{type:'button',class:`research-button ${primary?'primary':''}`,onClick:fn,disabled},label);
  return()=>h('div',{class:'quote-share-tool',onVnodeUnmounted:cleanup},[
   h('button',{type:'button',ref:trigger,class:`research-button quote-share-trigger ${props.row?'':'primary'}`,disabled:!record.value.text||!props.exists,onClick:open,'aria-haspopup':'dialog'},'引用を共有'),
   opened.value?h('dialog',{ref:dialog,class:'research quote-share-dialog','aria-labelledby':'quote-share-title',onCancel:event=>{event.preventDefault();close();}},[
    h('header',{class:'quote-share-header'},[h('div',{},[h('p',{class:'ux-eyebrow'},'引用カード'),h('h2',{id:'quote-share-title'},'一節を、出典とともに。')]),h('button',{type:'button',class:'quote-share-close',onClick:close,'aria-label':'共有を閉じる'},'×')]),
    h('div',{class:'quote-share-layout'},[
      h('section',{class:'quote-share-preview','aria-label':'共有画像のプレビュー'},[preview.value?h('img',{src:preview.value,alt:`${record.value.title} ${record.value.index}からの引用カード`,'aria-busy':busy.value}):h('p',{},busy.value?'画像を準備しています…':'本文から一節を選ぶと、画像をプレビューできます。')]),
      h('section',{class:'quote-share-options'},[
       h('p',{class:'quote-share-caption'},'本文を選択してから開くと、その一節を取り込めます。画像には抜粋・文書名・条番号を載せます。'),
       h('label',{class:'research-field'},[h('span',{class:'research-label'},'共有する抜粋'),h('textarea',{class:'research-textarea',rows:6,value:quote.value,onInput:event=>{quote.value=event.target.value;},'aria-invalid':!!error.value,'aria-describedby':'quote-share-error'})]),
       h('p',{class:'quote-share-count'},`${quoteLength(quote.value)} / ${MAX_QUOTE}文字`),
       h('p',{id:'quote-share-error',class:error.value?'research-error':'quote-share-caption',role:error.value?'alert':null},error.value||'文言を変えずに、引用元に含まれる一節を選べます。'),
       h('fieldset',{class:'quote-share-style'},[h('legend',{},'カードの見た目'),...[[true,'マーカー'],[false,'シンプル']].map(([value,label])=>h('label',{},[h('input',{type:'radio',name:'quote-card-style',checked:marker.value===value,onChange:()=>{marker.value=value;}}),label]))]),
       h('div',{class:'quote-share-actions'},[action('PNGを保存',download,!blob.value||!!error.value||busy.value,true),typeof ClipboardItem!=='undefined'&&navigator.clipboard?.write?action('画像をコピー',copyImage,!blob.value||!!error.value||busy.value):null,action('リンク付き引用をコピー',copyCitation,!!error.value)]),
       navigator.canShare?h('div',{class:'quote-share-actions'},action('端末の共有メニュー',fileShare,!blob.value||!!error.value||busy.value)):null,
       h('p',{role:'status',class:'quote-share-status','aria-live':'polite'},message.value|| (busy.value?'画像を更新しています…':'')),
       h('p',{class:'quote-share-caption'},'画像はこのブラウザーで作成します。社内の判断メモ・担当者・確認状況は含めません。'),
       h('details',{class:'quote-share-link-details'},[h('summary',{},'リンクだけで共有する'),h('p',{},record.value.public?'リンクのプレビューには文書の表紙が表示されます。選んだ抜粋は画像と一緒に共有できます。':'この端末内の文書には公開リンクがないため、引用画像をご利用ください。'),record.value.public?action('文書リンクをコピー',copyUrl):null,record.value.url?h('a',{href:record.value.url,target:'_blank',rel:'noopener noreferrer'},record.value.url):null]),
       h('details',{},[h('summary',{},'リンク付き引用'),h('textarea',{class:'research-textarea',rows:6,readOnly:true,value:error.value?'':shareText(record.value,quote.value),'aria-label':'コピー用のリンク付き引用'})]),
      ]),
    ]),
   ]):null,
  ]);
 }};
 return {ShareQuote};
}
