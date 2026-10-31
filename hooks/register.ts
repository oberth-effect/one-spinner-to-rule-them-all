import type { Register } from 'claude-code'

// FNV-1a, a small stable string hash: the same turn always maps to the same line.
export const hash = (s: string): number => {
  let h = 0x811c9dc5
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return h >>> 0
}

// Takes a list or one text. Any entry may hold several lines separated by new
// lines or semicolons. Commas are not separators, because many Tolkien lines hold one.
// Trailing dots are dropped since the engine draws its own ellipsis after the line.
export const parseVerbs = (raw: unknown): string[] => {
  const entries = Array.isArray(raw) ? raw.map(String) : [String(raw ?? '')]
  return entries
    .flatMap(v => v.split(/[\n;]/))
    .map(v => v.trim().replace(/(\.{3}|…)+$/, '').trimEnd())
    .filter(v => v.length > 0)
}

export const register: Register = (on, options) => {
  const verbs = parseVerbs(options.verbs)
  const isMix = options.mode === 'mix'

  on('ui.render', { component: 'Spinner' }, ($, e, next) => {
    // On the desktop the word describes the current step, so leave it alone.
    if (verbs.length === 0 || e.surface === 'desktop') return next(e)

    const pool = isMix ? [...verbs, e.props.word] : verbs
    // The engine samples a new word each turn. Keying on it and the agent id
    // keeps the pick steady within a turn and fresh across turns.
    const word = pool[hash(`${e.requestId}:${e.props.word}`) % pool.length] ?? e.props.word

    return next({ ...e, props: { ...e.props, word } })
  })
}
