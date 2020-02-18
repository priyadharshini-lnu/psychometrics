import ElementProcessor from 'libs/survey/core/preview/FlowProcessor/commands/ElementProcessor'
import { getNextElementId } from 'libs/survey/core/preview/FlowProcessor/selectors'
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
  expect(ElementProcessor.run(state, '0')).toStrictEqual({ element: '0', embeddedData: {} })
  expect(ElementProcessor.run(state, '1')).toStrictEqual({ element: '1/0/0', embeddedData: {} })
  expect(ElementProcessor.run(state, '1/0/1')).toStrictEqual({ element: '1/0/1', embeddedData: {} })
  expect(ElementProcessor.run(state, getNextElementId(state, '1/0/1'))).toStrictEqual({ element: '2', embeddedData: {} })
  expect(ElementProcessor.run(state, getNextElementId(state, '1/1'))).toStrictEqual({ element: '2', embeddedData: {} })
  expect(ElementProcessor.run(state, '2')).toStrictEqual({ element: '2', embeddedData: {} })
  expect(ElementProcessor.run(state, getNextElementId(state, '2'))).toStrictEqual({embeddedData: {}})
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
  expect(ElementProcessor.run(state2, '1')).toStrictEqual({ element: '2', embeddedData: {} })
})


const stateWithEmbeded = {
  normalizedTree: {
    0: { type: 'Block', props: { current: '1' } },
    1: { type: 'EmbeddedData', props: { storage: [{ key: 'test', value: '111' }] } },
  },
}

test('element processor should process next block if branch has not content', () => {
  expect(ElementProcessor.run(stateWithEmbeded, '0')).toStrictEqual({ element: '0', embeddedData: {} })
  expect(ElementProcessor.run(stateWithEmbeded, '1')).toStrictEqual({embeddedData: { test: '111' }})
  // expect(dispatch.mock.calls[0][0]).toStrictEqual({ type: 'flow_processor/SET_EMBEDDED_DATA', data: { test: '111' } })
})

const stateWithMultipleEmbeded = {
  normalizedTree: {
    '0': { type: 'Block', props: { current: '1' } },
    '1': { type: 'Randomizer', props: { number: 1 }},
    '1/0':{ type: 'EmbeddedData', props: { storage: [{ key: 't1', value: '1' }] } },
    '1/1':{ type: 'EmbeddedData', props: { storage: [{ key: 't2', value: '2' }] } },
    '2': { type: 'EmbeddedData', props: { storage: [{ key: 't3', value: '3' }] } },
  },
}

test('element processor should process next block if branch has not content', () => {
  expect(ElementProcessor.run(stateWithMultipleEmbeded, '0')).toStrictEqual({ element: '0', embeddedData: {} })
  expect(ElementProcessor.run(stateWithMultipleEmbeded, '1')).toStrictEqual({embeddedData: { t1: '1', t2: '2', t3: '3' }})
})


const stateInvalidBlock = {
  normalizedTree: {
    0: { type: 'Block', props: { current: '1' } },
    1: { type: 'WrongType', props: {} },
    2: { type: 'Block', props: { current: '5' } },
  },
}

test('element processor should ignore and skip invalid block type', () => {
  expect(ElementProcessor.run(stateInvalidBlock, '1')).toStrictEqual({ element: '2', embeddedData: {} })
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
  expect(ElementProcessor.run(stateWithRandomization, '0')).toStrictEqual({ element: '0', embeddedData: {} })
  expect(ElementProcessor.run(stateWithRandomization, '1')).toStrictEqual({ element: '1/0', embeddedData: {} })
  expect(ElementProcessor.run(stateWithRandomization, '1/0')).toStrictEqual({ element: '1/0', embeddedData: {} })
})
