import ElementProcessor from 'libs/survey/core/preview/FlowProcessor/ElementProcessor'
import { nextElementIdSelector } from 'libs/survey/core/preview/FlowProcessor/selectors'
import DefaultProps from 'libs/survey/constants/DefaultProps'

const state = {
  questions: {
    1: {
      id: 1,
      type: 'MultipleChoice',
      choicesIds: [0, 1, 2],
      props: {
        ...DefaultProps.MultipleChoice,
      },
    },
    2: {
      id: 2,
      type: 'MultipleChoice',
      choicesIds: [0, 1, 2],
      props: {
        ...DefaultProps.MultipleChoice,
      },
    },
  },
  results: {
    1: { answers: [{ index: 0, value: true }] },
    2: { answers: [{ index: 1, value: true }] },
  },
  normalizedTree: {
    0: { type: 'Block', props: { current: '1' } },
    1: {
      type: 'Branch',
      props: {
        conditions: [{
          conditionType: 'Question',
          type: 'bool',
          subject: 1,
          answer: '0',
          predicate: 'Selected',
          value: '',
        }],
      },
    },
    '1/0': {
      type: 'Branch',
      props: {
        conditions: [{
          conditionType: 'Question',
          type: 'bool',
          subject: 2,
          answer: '1',
          predicate: 'Selected',
          value: '',
        }],
      },
    },
    '1/0/0': { type: 'Block', props: { current: '3' } },
    '1/0/1': { type: 'Block', props: { current: '4' } },
    2: { type: 'Block', props: { current: '5' } },
  },
}

test('next element id should return valid result', () => {
  expect(ElementProcessor(state, '0')).toStrictEqual({ element: '0' })
  expect(ElementProcessor(state, '1')).toStrictEqual({ element: '1/0/0' })
  expect(ElementProcessor(state, '1/0/1')).toStrictEqual({ element: '1/0/1' })
  expect(ElementProcessor(state, nextElementIdSelector(state, '1/0/1'))).toStrictEqual({ element: '2' })
  expect(ElementProcessor(state, nextElementIdSelector(state, '1/1'))).toStrictEqual({ element: '2' })
  expect(ElementProcessor(state, '2')).toStrictEqual({ element: '2' })
  expect(ElementProcessor(state, nextElementIdSelector(state, '2'))).toStrictEqual(null)
})


const state2 = {
  normalizedTree: {
    0: { type: 'Block', props: { current: '1' } },
    1: { type: 'Branch', props: { conditions: [] } },
    '1/0': { type: 'Branch', props: { conditions: [] } },
    2: { type: 'Block', props: { current: '5' } },
  },
}

test('element processor should process next block if branch has not content', () => {
  expect(ElementProcessor(state2, '1')).toStrictEqual({ element: '2' })
})


const stateWithEmbeded = {
  normalizedTree: {
    0: { type: 'Block', props: { current: '1' } },
    1: { type: 'EmbeddedData', props: { storage: [{ key: 'test', value: '111' }] } },
  },
}

test('element processor should process next block if branch has not content', () => {
  expect(ElementProcessor(stateWithEmbeded, '0')).toStrictEqual({ element: '0' })
  const dispatch = jest.fn()
  expect(ElementProcessor(stateWithEmbeded, '1', dispatch)).toStrictEqual(null)
  expect(dispatch.mock.calls.length).toBe(1)
  expect(dispatch.mock.calls[0][0]).toStrictEqual({ type: 'flow_processor/SET_EMBEDDED_DATA', data: { test: '111' } })
})


const stateInvalidBlock = {
  normalizedTree: {
    0: { type: 'Block', props: { current: '1' } },
    1: { type: 'WrongType', props: {} },
    2: { type: 'Block', props: { current: '5' } },
  },
}

test('element processor should ignore and skip invalid block type', () => {
  expect(ElementProcessor(stateInvalidBlock, '1')).toStrictEqual({ element: '2' })
})


const stateWithRandomization = {
  normalizedTree: {
    0: { type: 'Block', props: { current: '1' } },
    1: { type: 'Randomizer', props: { number: 1 } },
    '1/0': { type: 'Block', props: { current: '2' } },
    2: { type: 'Block', props: { current: '3' } },
  },
}

test('element processor should ignore and skip invalid block type', () => {
  expect(ElementProcessor(stateWithRandomization, '0')).toStrictEqual({ element: '0' })
  expect(ElementProcessor(stateWithRandomization, '1')).toStrictEqual({ element: '1/0' })
  expect(ElementProcessor(stateWithRandomization, '1/0')).toStrictEqual({ element: '1/0' })
})
