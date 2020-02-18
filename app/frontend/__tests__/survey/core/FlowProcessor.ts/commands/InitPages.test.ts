import InitPages from 'libs/survey/core/preview/FlowProcessor/commands/InitPages'
import _ from 'lodash'

const question = (id, data = {}) => ({ id, ...data })

test('empty blocks', () => {
  expect(InitPages.run({ blocks: [] })).toStrictEqual({})
})

test('simple block with one page', () => {
  const blocks = [{
    id: 1,
    questions: [question(1), question(2)],
  }]

  expect(InitPages.run({ blocks })).toStrictEqual({ 1: [{ questions: [1, 2], blockId: 1 }] })
})

test('simple block with page_break', () => {
  const blocks = [{
    id: 1,
    questions: [question(1), question(2, { type: 'PageBreak' }), question(3)],
  }]

  expect(InitPages.run({ blocks })).toStrictEqual({ 1: [{ questions: [1], blockId: 1 }, { questions: [3], blockId: 1 }] })
})

test('simple block with question with display_logic', () => {
  const blocks = [{
    id: 1,
    questions: [question(1), question(2, { display_logic: {} })],
  }]

  expect(InitPages.run({ blocks })).toStrictEqual({ 1: [{ questions: [1], blockId: 1 }, { questions: [2], blockId: 1 }] })
})


test('simple block with question with display_logic and a question after', () => {
  const blocks = [{
    id: 1,
    questions: [question(1), question(2, { display_logic: {} }), question(3)],
  }]

  expect(InitPages.run({ blocks })).toStrictEqual({
    1: [{ questions: [1], blockId: 1 }, { questions: [2, 3], blockId: 1 }],
  })
})

test('simple block with question with skip_logic one page', () => {
  const blocks = [{
    id: 1,
    questions: [question(1), question(2, { skip_logic: [] })],
  }]

  expect(InitPages.run({ blocks })).toStrictEqual({ 1: [{ questions: [1, 2], blockId: 1 }] })
})


test('simple block with question with skip_logic and display logic', () => {
  const blocks = [{
    id: 1,
    questions: [question(1), question(2, { skip_logic: [] }), question(3, { display_logic: { test: 1 } })],
  }]

  expect(InitPages.run({ blocks })).toStrictEqual({ 1: [{ questions: [1, 2], blockId: 1 }, { questions: [3], blockId: 1 }] })
})

test('simple block with question with skip_logic two pages', () => {
  const blocks = [{
    id: 1,
    questions: [question(1), question(2, { skip_logic: [1] }), question(3)],
  }]

  expect(InitPages.run({ blocks })).toStrictEqual({ 1: [{ questions: [1, 2], blockId: 1, skipLogic: [1] }, { questions: [3], blockId: 1 }] })
})


test('simple two blocks', () => {
  const blocks = [{
    id: 1,
    questions: [question(1), question(2), question(3)],
  },
  {
    id: 2,
    questions: [question(4), question(5)],
  }]

  expect(InitPages.run({ blocks })).toStrictEqual({ 1: [{ questions: [1, 2, 3], blockId: 1 }], 2: [{ questions: [4, 5], blockId: 2 }] })
})
