import SkipLogicProcessor from 'libs/survey/core/preview/FlowProcessor/SkipLogicProcessor'
import { initPages } from 'libs/survey/core/preview/FlowProcessor/helpers'
import DefaultProps from 'libs/survey/constants/DefaultProps'

const question = (id, data = {}) => ({ id, ...data })

const multipleChoice = {
  type: 'MultipleChoice',
  required_validation: { enabled: true, type: 'Force' },
  validation: { type: 'None', args: {} },
  choicesIds: [0, 1, 2],
  props: {
    ...DefaultProps.MultipleChoice,
  },
}

const textEntry = {
  type: 'TextEntry',
  required_validation: { enabled: false },
  validation: { type: 'MinLength', args: { minLength: 5 } },
  props: {
    ...DefaultProps.TextEntry,
  },
}

test('empty skip logic should return false', () => {
  expect(SkipLogicProcessor([], {}, {})).toStrictEqual(false)
})

const skipLogic = {
  subject: 1,
  prefix: 'And',
  answer: '0',
  predicate: 'Selected',
  type: 'bool',
  destination: 'EndOfBlock',
}

const results = {
  1: { answers: [{ index: 0, value: true }] },
  2: { answers: [{ index: 1, value: true }] },
}

test('first page should have skip logic', () => {
  const blocks = [{
    id: 1,
    questions: [question(1, { ...multipleChoice, skip_logic: [skipLogic] }), question(2, { ...multipleChoice }), question(3, multipleChoice)],
  }]

  const pages = initPages({ blocks })

  expect(pages[1][0].skipLogic).toStrictEqual([skipLogic])
})


test('skip logic should return false for empty results', () => {
  const blocks = [{
    id: 1,
    questions: [question(1, { ...multipleChoice, skip_logic: [skipLogic] }), question(2, { ...multipleChoice }), question(3, multipleChoice)],
  }]
  const questions = blocks[0].questions.reduce((acc, q) => acc[q.id] = q)

  const pages = initPages({ blocks })

  expect(SkipLogicProcessor(pages[1][0].skipLogic, questions, {})).toStrictEqual(false)
})

test('valid skip logic should return type of skipping', () => {
  const blocks = [{
    id: 1,
    questions: [question(1, { ...multipleChoice, skip_logic: [skipLogic] }), question(2, { ...multipleChoice }), question(3, multipleChoice)],
  }]
  const questions = blocks[0].questions.reduce((acc, q) => { acc[q.id] = q; return acc }, {})
  const pages = initPages({ blocks })

  expect(SkipLogicProcessor(pages[1][0].skipLogic, questions, results)).toStrictEqual({ type: 'EndOfBlock' })
})


const skipToSpecificBlock = {
  subject: 1,
  prefix: 'And',
  answer: '0',
  predicate: 'Selected',
  type: 'bool',
  destination: 'SpecificBlock',
  destinationBlock: 2,
}

test('skip to specific block should return type of skipping and block id', () => {
  const blocks = [{
    id: 1,
    questions: [question(1, { ...multipleChoice, skip_logic: [skipToSpecificBlock] }), question(2, { ...multipleChoice }), question(3, multipleChoice)],
  }]
  const questions = blocks[0].questions.reduce((acc, q) => { acc[q.id] = q; return acc }, {})
  const pages = initPages({ blocks })

  expect(SkipLogicProcessor(pages[1][0].skipLogic, questions, results)).toStrictEqual({ type: 'SpecificBlock', blockId: 2 })
})


test('skip to specific block should return false if block is not specified', () => {
  const blocks = [{
    id: 1,
    questions: [question(1, { ...multipleChoice, skip_logic: [{ ...skipToSpecificBlock, destinationBlock: null }] }), question(2, { ...multipleChoice }), question(3, multipleChoice)],
  }]
  const questions = blocks[0].questions.reduce((acc, q) => { acc[q.id] = q; return acc }, {})
  const pages = initPages({ blocks })

  expect(SkipLogicProcessor(pages[1][0].skipLogic, questions, results)).toStrictEqual(false)
})
