import ValidationProcessor from '~/modules/survey/core/preview/FlowProcessor/commands/ValidationProcessor'
import DefaultProps from '~/modules/survey/constants/DefaultProps'

jest.mock('modules/survey/store/StoreWatchman', () => {
  return {
    I18n: () => ({
      t: (t) => t,
      lookup: (code) => code,
    }),
  }
})


const multipleChoice = {
  id: 1,
  type: 'MultipleChoice',
  required_validation: { enabled: true, type: 'Force' },
  validation: { type: 'None', args: {} },
  choicesIds: [0, 1, 2],
  props: {
    ...DefaultProps.MultipleChoice,
  },
}

const textEntry = {
  id: 2,
  type: 'TextEntry',
  required_validation: { enabled: false, type: 'Force' },
  validation: { type: 'MinLength', args: { minLength: 5 } },
  props: {
    ...DefaultProps.TextEntry,
  },
}

test('empty validations should return empty array', () => {
  expect(ValidationProcessor.run([], {}, [])).toStrictEqual({})
})

test('required validation should return an error', () => {
  expect(ValidationProcessor.run([multipleChoice], {}, [])).toStrictEqual({
    1: [{ message: 'validations.required', type: 'forceRequired' }],
  })
})

test('required validation should return an error', () => {
  expect(ValidationProcessor.run([multipleChoice, textEntry], { 2: { answers: [{ value: 'test' }] } }, [])).toStrictEqual({
    1: [{ message: 'validations.required', type: 'forceRequired' }],
    2: [{ message: 'validations.min_character', type: 'MinLength' }],
  })
})

test('required return an error only required validation', () => {
  expect(ValidationProcessor.run([multipleChoice, textEntry], { 2: { answers: [{ value: 'test test' }] } }, [])).toStrictEqual({
    1: [{ message: 'validations.required', type: 'forceRequired' }],
  })
})

test('required return empty errors for valid results', () => {
  const results = {
    1: { answers: [{ index: 0, value: true }] },
    2: { answers: [{ value: 'test test' }] },
  }
  expect(ValidationProcessor.run([multipleChoice, textEntry], results, [])).toStrictEqual({})
})
