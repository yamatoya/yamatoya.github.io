// This bridge has static metadata for crawlers. Readers continue to the cited
// public document. Only known item IDs and a valid as-of date are forwarded.
const element=document.querySelector('[data-document]');
if(element) {
  const doc=element.dataset.document,items=JSON.parse(element.dataset.items||'[]');
  const query=new URLSearchParams(location.search),item=query.get('item'),asOf=query.get('asof');
  const path='/document/'+encodeURIComponent(doc)+(items.includes(item)?'/'+encodeURIComponent(item):'');
  const target=new URL(path,location.origin);
  if(asOf && /^\d{4}-\d{2}-\d{2}$/.test(asOf)) {
    const date=new Date(asOf+'T00:00:00Z');
    if(!Number.isNaN(date.getTime()) && date.toISOString().slice(0,10)===asOf)target.searchParams.set('asof',asOf);
  }
  document.querySelector('#read-document').href=target.href;
  location.replace(target.href);
}
