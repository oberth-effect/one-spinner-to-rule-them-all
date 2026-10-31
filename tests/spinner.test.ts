import { test, expect } from 'claude-code/testing'
import type { RenderElement } from 'claude-code'

const PLUGIN = 'one-spinner-to-rule-them-all'

const spinner = <S extends 'terminal' | 'desktop' | 'vscode'>(surface: S, word: string, requestId = 'main') => ({
  plugin: PLUGIN,
  surface,
  component: 'Spinner' as const,
  requestId,
  props: { word, message: null, suffix: '…', mode: 'thinking' as const },
})

// Stands for the engine beneath the plugin: records what the plugin passed on
// and draws it, so the test reads the word and the ellipsis the engine would get.
const recordSpinner = (on: Parameters<Parameters<typeof test>[1]>[1], seen: { word: string; suffix: string }[]) =>
  on('ui.render', { component: 'Spinner' }, ($, e) => {
    seen.push({ word: e.props.word, suffix: e.props.suffix })
    const { Text } = $.ui.resolve(e)
    return h(Text, {}, e.props.word + e.props.suffix) as RenderElement
  })

const draw = async ($: Parameters<Parameters<typeof test>[1]>[0], target: ReturnType<typeof spinner>) => {
  const ui = await $.ui.mount(target)
  await ui.unmount()
}

test('swaps the word for a line from the list, steady within a turn', { options: { verbs: ['Brewing', 'Hexing'] } }, async ($, on) => {
  const seen: { word: string; suffix: string }[] = []
  recordSpinner(on, seen)
  for (const surface of ['terminal', 'vscode'] as const) {
    seen.length = 0
    await draw($, spinner(surface, 'Sauteing'))
    await draw($, spinner(surface, 'Sauteing'))
    expect(['Brewing', 'Hexing']).toContain(seen[0]?.word)
    expect(seen[1]?.word).toBe(seen[0]?.word)
  }
})

test('keeps the engine ellipsis after the line', { options: { verbs: ['Drumming in the deep'] } }, async ($, on) => {
  const seen: { word: string; suffix: string }[] = []
  recordSpinner(on, seen)
  const ui = await $.ui.mount(spinner('terminal', 'Sauteing'))
  expect(seen[0]).toEqual({ word: 'Drumming in the deep', suffix: '…' })
  expect((await ui.find({ type: 'Text' }))?.text).toBe('Drumming in the deep…')
  await ui.unmount()
})

test('leaves the desktop step text alone', { options: { verbs: ['Brewing'] } }, async ($, on) => {
  const seen: { word: string; suffix: string }[] = []
  recordSpinner(on, seen)
  await draw($, spinner('desktop', 'Creating notes.md'))
  expect(seen[0]?.word).toBe('Creating notes.md')
})

test('mix mode can keep the engine word', { options: { verbs: ['Brewing'], mode: 'mix' } }, async ($, on) => {
  const seen: { word: string; suffix: string }[] = []
  recordSpinner(on, seen)
  for (const w of ['Sauteing', 'Baking', 'Whisking', 'Simmering', 'Roasting', 'Grilling', 'Frying', 'Poaching']) {
    await draw($, spinner('terminal', w))
  }
  const words = new Set(seen.map(s => s.word))
  expect(words.has('Brewing')).toBe(true)
  expect(words.size).toBeGreaterThan(1)
})

test('takes a list and drops trailing dots', { options: { verbs: ['Brewing...', 'Hexing…'] } }, async ($, on) => {
  const seen: { word: string; suffix: string }[] = []
  recordSpinner(on, seen)
  for (const w of ['Sauteing', 'Baking', 'Whisking', 'Simmering', 'Roasting', 'Grilling']) {
    await draw($, spinner('terminal', w))
  }
  expect(seen.every(s => s.word === 'Brewing' || s.word === 'Hexing')).toBe(true)
})

test('splits typed text on new lines and semicolons, never on commas', { options: { verbs: ['Bringing ruin, turning hope to despair; Drumming in the deep\nIlluminating nothing'] } }, async ($, on) => {
  const seen: { word: string; suffix: string }[] = []
  recordSpinner(on, seen)
  for (const w of ['Sauteing', 'Baking', 'Whisking', 'Simmering', 'Roasting', 'Grilling', 'Frying', 'Poaching']) {
    await draw($, spinner('terminal', w))
  }
  const allowed = ['Bringing ruin, turning hope to despair', 'Drumming in the deep', 'Illuminating nothing']
  expect(seen.every(s => allowed.includes(s.word))).toBe(true)
})

test('the default Tolkien list loads with its lines whole', async ($, on) => {
  const seen: { word: string; suffix: string }[] = []
  recordSpinner(on, seen)
  for (const w of ['Sauteing', 'Baking', 'Whisking', 'Simmering', 'Roasting', 'Grilling', 'Frying', 'Poaching', 'Braising', 'Searing']) {
    await draw($, spinner('terminal', w))
  }
  for (const s of seen) {
    expect(s.word).not.toBe('Sauteing')
    // Every default line starts with a capital: a line split at a comma would not.
    expect(s.word).toMatch(/^[A-Z]/)
    expect(s.suffix).toBe('…')
  }
})
