import InitPages from '~/modules/survey/core/preview/FlowProcessor/commands/InitPages'
import _ from 'lodash'

const question = (id, data = {}) => ({ id, ...data })

test('empty blocks', () => {
  expect(InitPages.run({ blocks: [] })).toStrictEqual({})
})

test('deleted question', () => {
  const blocks = [{
    id: 1,
    questions: [question(1, { deleted: true })],
  }]
  expect(InitPages.run({ blocks })).toStrictEqual({ [Symbol.for('1')]: [] })
})


test('deleted question', () => {
  const blocks = [{
    id: 1,
    questions: [question(1), question(2, { deleted: true }), question(3)],
  }]
  expect(InitPages.run({ blocks })).toStrictEqual({ [Symbol.for('1')]: [{ questions: [1, 3], blockId: 1 }] })
})

test('simple block with one page', () => {
  const blocks = [{
    id: 1,
    questions: [question(1), question(2)],
  }]

  expect(InitPages.run({ blocks })).toStrictEqual({ [Symbol.for('1')]: [{ questions: [1, 2], blockId: 1 }] })
})

test('simple block with page_break', () => {
  const blocks = [{
    id: 1,
    questions: [question(1), question(2, { type: 'PageBreak' }), question(3)],
  }]

  expect(InitPages.run({ blocks })).toStrictEqual({ [Symbol.for('1')]: [{ questions: [1], blockId: 1 }, { questions: [3], blockId: 1 }] })
})

test('simple block with question with display_logic', () => {
  const blocks = [{
    id: 1,
    questions: [question(1), question(2, { display_logic: {} })],
  }]

  expect(InitPages.run({ blocks })).toStrictEqual({ [Symbol.for('1')]: [{ questions: [1], blockId: 1 }, { questions: [2], blockId: 1 }] })
})


test('simple block with question with display_logic and a question after', () => {
  const blocks = [{
    id: 1,
    questions: [question(1), question(2, { display_logic: {} }), question(3)],
  }]

  expect(InitPages.run({ blocks })).toStrictEqual({
    [Symbol.for('1')]: [{ questions: [1], blockId: 1 }, { questions: [2, 3], blockId: 1 }],
  })
})

test('simple block with question with skip_logic one page', () => {
  const blocks = [{
    id: 1,
    questions: [question(1), question(2, { skip_logic: [] })],
  }]

  expect(InitPages.run({ blocks })).toStrictEqual({ [Symbol.for('1')]: [{ questions: [1, 2], blockId: 1 }] })
})


test('simple block with question with skip_logic and display logic', () => {
  const blocks = [{
    id: 1,
    questions: [question(1), question(2, { skip_logic: [] }), question(3, { display_logic: { test: 1 } })],
  }]

  expect(InitPages.run({ blocks })).toStrictEqual({ [Symbol.for('1')]: [{ questions: [1, 2], blockId: 1 }, { questions: [3], blockId: 1 }] })
})

test('simple block with question with skip_logic two pages', () => {
  const blocks = [{
    id: 1,
    questions: [question(1), question(2, { skip_logic: [1] }), question(3)],
  }]

  expect(InitPages.run({ blocks })).toStrictEqual({ [Symbol.for('1')]: [{ questions: [1, 2], blockId: 1, skipLogic: [1] }, { questions: [3], blockId: 1 }] })
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

  expect(InitPages.run({ blocks })).toStrictEqual({ [Symbol.for('1')]: [{ questions: [1, 2, 3], blockId: 1 }], [Symbol.for('2')]: [{ questions: [4, 5], blockId: 2 }] })
})


test('with single_question_page', () => {
  const blocks = [{
    id: 1,
    questions: [question(1), question(2), question(3)],
  },
  {
    id: 2,
    questions: [question(4), question(5)],
  }]

  expect(InitPages.run({ blocks }, 0, { enable_single_question_page: true })).toStrictEqual({
    [Symbol.for('1')]: [
      {
        questions: [1], blockId: 1
      },
      {
        questions: [2], blockId: 1
      },
      {
        questions: [3], blockId: 1
      }
    ],
    [Symbol.for('2')]: [
      {
        questions: [4], blockId: 2
      },
      {
        questions: [5], blockId: 2
      }
    ]
  })
})

test('simple block with n (2 here) questions per page', () => {
  const blocks = [{
    id: 1,
    questions: [question(1), question(2), question(3), question(4), question(5), question(6)],
    props: {
      randomization: {
        type: 'QuestionsPerPage',
        questions: 2
      }
    }
  }]

  expect(InitPages.run({ blocks })).toStrictEqual({
    [Symbol.for('1')]: [{ questions: [1, 2], blockId: 1 }, { questions: [3, 4], blockId: 1 }, { questions: [5, 6], blockId: 1 }]
  })
})
