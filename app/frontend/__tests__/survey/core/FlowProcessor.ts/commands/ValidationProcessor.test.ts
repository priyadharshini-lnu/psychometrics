import ValidationProcessor from '~/modules/survey/core/preview/FlowProcessor/commands/ValidationProcessor'
import DefaultProps from '~/modules/survey/constants/DefaultProps'

vi.mock('~/modules/survey/store/StoreWatchman', () => {
  return {
    I18n: () => ({
      t: (t) => t,
      lookup: (code) => code,
      tCustomValidation () { return 'error'}
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


const customValidation = {
  id: 3,
  type: 'TextEntry',
  required_validation: { enabled: false, type: 'Force' },
  validation: {
    type: 'Custom',
    customValidations: [{
      uuid: '1',
      conditions: [{
        subject: 1,
        answer: "1",
        predicate:"Selected",
        type:"bool"
      }],
      message: 'aaaaa'
    }]
  },
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


test('return errors for custom validation', () => {
  const results = {
    1: { answers: [{ index: 0, value: true }] },
    2: { answers: [{ value: 'test test' }] },
  }

  expect(ValidationProcessor.run([customValidation], results, [], [multipleChoice])).toStrictEqual({
    '3': [ { type: 'Custom', message: 'error' } ]
  })
})

test('should pass well custom validation', () => {
  const results = {
    1: { answers: [{ index: 1, value: true }] },
    2: { answers: [{ value: 'test test' }] },
  }

  expect(ValidationProcessor.run([customValidation], results, [], [multipleChoice])).toStrictEqual({})
})
