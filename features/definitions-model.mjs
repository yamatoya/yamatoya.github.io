import { normalize, rowKey } from './research-model.mjs';
import { matchesService } from './services.mjs';
export const DEFINITION_TERMS = ['暗号資産', '電子決済手段', '利用者財産', '個人情報', '本サービス', '本取引', '利用者', 'ステーキング'];
export function definitionUnits(text) {
  const units = []; let start = 0, depth = 0;
  for (let i = 0; i < text.length; i++) {
    if ('（('.includes(text[i])) depth++;
    if ('）)'.includes(text[i])) depth = Math.max(0, depth - 1);
    if (!depth && (text[i] === '。' || text[i] === '\n')) { units.push(text.slice(start, i + 1).trim()); start = i + 1; }
  }
  units.push(text.slice(start).trim()); return units.filter(Boolean);
}
export function definitionMatches(catalog, term, { provider = '', kind = '', service = '', includeCommon = true, definitionsOnly = true } = {}) {
  const wanted = normalize(term);
  if (!wanted) return [];
  const escaped = wanted.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  // Require the requested term itself next to a definition marker. A distant
  // "をいう" for a different expression is only a mention, not this definition.
  const direct = new RegExp(`「${escaped}」(?:とは|は|をいう)|『${escaped}』(?:とは|は|をいう)|(?:^|[（(。\\n、：:])${escaped}(?:とは)|${escaped}[（(][^。]{0,300}をいう`);
  const listed = new RegExp(`^(?:[一二三四五六七八九十百]+|[0-9]+)[.．)）]?\\s+${String(term).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s+[^。]{0,600}をいう`);
  return catalog.rows.filter(row => (!provider || row.provider === provider) && (!kind || row.kind === kind) && matchesService(row, service, includeCommon) && row.body.includes(wanted))
    .map(row => {
      const units = definitionUnits(row.text).filter(value => normalize(value).includes(wanted));
      const definition = units.find(value => direct.test(normalize(value)) || listed.test(value));
      const heading = /定義|用語の意味|用語の意義/.test(row.trail + ' ' + row.item.index);
      return { row, definition: !!definition || heading, basis: definition ? '定義表現を含む箇所' : heading ? '定義の見出しにある項目' : '用語への言及', quote: definition || units[0] || row.text, key: rowKey(row) };
    }).filter(value => !definitionsOnly || value.definition)
    .sort((a, b) => Number(b.basis === '定義表現を含む箇所') - Number(a.basis === '定義表現を含む箇所') || (['law', 'company', 'jvcea', 'guideline', 'reference'].indexOf(a.row.kind) - ['law', 'company', 'jvcea', 'guideline', 'reference'].indexOf(b.row.kind)) || a.key.localeCompare(b.key, 'ja'));
}
