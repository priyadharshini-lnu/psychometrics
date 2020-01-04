import ValidationProcessor from 'libs/survey/core/preview/FlowProcessor/ValidationProcessor'
import DefaultProps from 'libs/survey/constants/DefaultProps'

const multipleChoice = {
  id: 1,
  type: 'MultipleChoice',
  requiredValidation: {enabled: true, type: 'Force'},
  validation: { type: 'None', args: {} },
  choicesIds: [0, 1, 2],
  props: {
    ...DefaultProps.MultipleChoice
  }
}

const textEntry = {
  id: 2,
  type: 'TextEntry',
  requiredValidation: {enabled: false},
  validation: { type: 'MinLength', args: {minLength: 5} },
  props: {
    ...DefaultProps.TextEntry
  }
}

test('empty validations should return empty array', () => {
  expect(ValidationProcessor([], {})).toStrictEqual({});
});

test('required validation validation should return an error', () => {
  expect(ValidationProcessor([multipleChoice], {})).toStrictEqual({
    1: [{message: 'validations.please_answer_question', type: 'forceRequired'}],
  });
});

test('required validation validation should return an error', () => {
  expect(ValidationProcessor([multipleChoice, textEntry], {2: {answers: [{value: 'test'}]}})).toStrictEqual({
    1: [{message: 'validations.please_answer_question', type: 'forceRequired'}],
    2: [{message: 'validations.min_length', type: 'MinLength'}]
  });
});

test('required return an error only required validation', () => {
  expect(ValidationProcessor([multipleChoice, textEntry], {2: {answers: [{value: 'test test'}]}})).toStrictEqual({
    1: [{message: 'validations.please_answer_question', type: 'forceRequired'}],
  });
});

test('required return empty errors for valid results', () => {
  const results = {
    1: {answers: [{index: 0, value: true}]},
    2: {answers: [{value: 'test test'}]}
  }
  expect(ValidationProcessor([multipleChoice, textEntry], results)).toStrictEqual({});
});
