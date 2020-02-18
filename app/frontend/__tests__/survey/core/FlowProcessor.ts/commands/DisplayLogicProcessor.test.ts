import DisplayLogicProcessor from 'libs/survey/core/preview/FlowProcessor/commands/DisplayLogicProcessor'
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

test('empty display logic should return true', () => {
  expect(DisplayLogicProcessor.run({}, {}, {})).toBe(false)
})


const displayLogic = {
  conditions: [
    {
      prefix: 'And',
      conditions: [
        {
          conditionType: 'Question',
          type: 'bool',
          subject: 1,
          prefix: 'And',
          answer: '0',
          predicate: 'Selected',
        },
      ],
    },
  ],
}

const results = {
  1: { answers: [{ index: 0, value: true }] },
  2: { answers: [{ index: 1, value: true }] },
}

test('display logic should return false for empty results', () => {
  const questions = {
    1: question(1, { ...multipleChoice }),
    2: question(2, { ...multipleChoice }),
    3: question(3, { ...multipleChoice }),
  }

  expect(DisplayLogicProcessor.run(displayLogic, questions, {})).toBe(false)
})


test('display logic should return true for valid results', () => {
  const questions = {
    1: question(1, { ...multipleChoice }),
    2: question(2, { ...multipleChoice }),
    3: question(3, { ...multipleChoice }),
  }

  expect(DisplayLogicProcessor.run(displayLogic, questions, results)).toBe(true)
})
