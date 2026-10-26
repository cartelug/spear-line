// A small, exact CSS splitter: turns the bundled stylesheet into rules that keep their original source text.
// Used by the build to inline each page's critical rules, and by scripts/critical.mjs to decide which rules those are.

const GROUPS = /^@(media|supports|container|layer)\b/;

export function parseCss(css) {
  let i = 0;
  function skipString(quote) { i++; while (i < css.length && css[i] !== quote) { if (css[i] === '\\') i++; i++; } i++; }
  function block(context) {
    const rules = [];
    while (i < css.length) {
      while (i < css.length && /\s/.test(css[i])) i++;
      if (i >= css.length || css[i] === '}') { i++; return rules; }
      const start = i;
      while (i < css.length && css[i] !== '{' && css[i] !== ';' && css[i] !== '}') { if (css[i] === '"' || css[i] === "'") skipString(css[i]); else i++; }
      const prelude = css.slice(start, i).trim().replace(/\s+/g, ' ');
      if (css[i] === ';') { i++; rules.push({ type: 'statement', prelude, text: css.slice(start, i), context }); continue; }
      if (css[i] === '}') continue;
      i++; // opening brace
      if (GROUPS.test(prelude)) {
        const children = block([...context, prelude]);
        rules.push({ type: 'group', prelude, children, context });
        continue;
      }
      let depth = 1;
      while (i < css.length && depth) { const c = css[i]; if (c === '"' || c === "'") { skipString(c); continue; } if (c === '{') depth++; else if (c === '}') depth--; i++; }
      const text = css.slice(start, i);
      rules.push({ type: prelude.startsWith('@') ? 'atrule' : 'style', prelude, text, context, key: [...context, prelude].join(' | ') });
    }
    return rules;
  }
  return block([]);
}

// Every style rule, flattened, with the key that identifies it across builds.
export function styleRules(tree, out = []) {
  for (const rule of tree) {
    if (rule.type === 'group') styleRules(rule.children, out);
    else if (rule.type === 'style') out.push(rule);
  }
  return out;
}

// Rebuilds a stylesheet from the rules a predicate keeps, preserving order and wrapping groups.
export function serialize(tree, keep) {
  let css = '';
  for (const rule of tree) {
    if (rule.type === 'group') {
      const inner = serialize(rule.children, keep);
      if (inner) css += rule.prelude + '{' + inner + '}';
    } else if (keep(rule)) css += rule.text.replace(/\s*\n\s*/g, ' ');
  }
  return css;
}

// The critical stylesheet for one page: its listed style rules plus the at-rules they depend on.
export function criticalCss(tree, keys) {
  const wanted = new Set(keys);
  const styles = styleRules(tree).filter(rule => wanted.has(rule.key) || rule.prelude.includes('::view-transition'));
  const used = styles.map(rule => rule.text).join('');
  return serialize(tree, rule => {
    if (rule.type === 'style') return wanted.has(rule.key) || rule.prelude.includes('::view-transition');
    if (rule.type === 'statement') return true;
    const at = rule.prelude.match(/^@([\w-]+)\s*(.*)$/);
    if (!at) return false;
    if (at[1] === 'keyframes') return new RegExp('(^|[\\s,:])' + at[2].replace(/[^\w-]/g, '') + '([\\s,;}]|$)').test(used);
    return ['font-face', 'property', 'view-transition'].includes(at[1]);
  });
}
