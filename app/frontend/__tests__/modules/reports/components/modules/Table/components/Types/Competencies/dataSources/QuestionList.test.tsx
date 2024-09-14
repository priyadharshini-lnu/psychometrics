import {
  questionsToTreeDataStructure,
  treeValuesToQuestionChoices,
  questionChoicesToTreeValues,
} from '~/modules/reports/components/modules/Table/components/Types/Competencies/dataSources/QuestionList'

const defaultQuestion = {
  update: vi.fn(),
  changeArrayProps: vi.fn(),
  changeReqValidations: vi.fn(),
  changeProps: vi.fn(),
  resetDefaultValues: vi.fn(),
  setChoices: vi.fn(),
  setFormFields: vi.fn(),
  id: 1,
  block_id: 2,
  name: 'example question text',
  position: 3,
  validation: {
    type: 'required',
    args: {},
  },
  requiredValidation: {
    enabled: false,
    type: 'empty',
  },
  moduleConfig: {},
  props: {},
}

describe('Func questionsToTreeDataStructure', () => {
  test('should return empty array when number of questions are zero', () => {
    const treeData = questionsToTreeDataStructure({})
    expect(treeData.length).toBe(0)
  })

  test('should filter out non sidebyside and matrix questions', () => {
    const questionsWithoutSideBySideAndMatrix = {
      '0982': {
        type: 'AudioResponse',
        ...defaultQuestion,
      },
      '0922': {
        type: 'Dropdown',
        ...defaultQuestion,
      },
    }
    const treeData1 = questionsToTreeDataStructure(
      questionsWithoutSideBySideAndMatrix
    )
    expect(treeData1.length).toBe(0)

    const questionsWithSideBySideAndMatrix = {
      '0912': {
        type: 'SideBySide',
        ...defaultQuestion,
        props: {
          choicesTexts: ['choice 1', 'choice 2'],
        },
      },
      '0922': {
        type: 'Dropdown',
        ...defaultQuestion,
      },
      '0822': {
        type: 'MatrixTable',
        ...defaultQuestion,
        props: {
          choicesTexts: ['choice 1', 'choice 2'],
        },
      },
    }
    const treeData2 = questionsToTreeDataStructure(
      questionsWithSideBySideAndMatrix
    )
    expect(treeData2.length).toBe(2)
  })

  test('should return correct format of tree data', () => {
    const questions = {
      '0912': {
        type: 'SideBySide',
        ...defaultQuestion,
        props: {
          choicesTexts: ['choice 1', 'choice 2'],
        },
      },
    }
    const treeData = questionsToTreeDataStructure(questions)

    expect(treeData.length).toBe(1)
    expect(treeData).toEqual([
      {
        title: 'example question text',
        value: 1,
        children: [
          {
            title: 'choice 1',
            value: '1_0',
          },
          {
            title: 'choice 2',
            value: '1_1',
          },
        ],
      },
    ])
  })
})

describe('Func treeValuesToQuestionChoices', () => {
  test('should return empty array when no selection is made', () => {
    const selectedQuestion = treeValuesToQuestionChoices([])
    expect(selectedQuestion.length).toBe(0)
  })

  test('should not return selections of incorrect string patterns', () => {
    const selectedQuestion = treeValuesToQuestionChoices([
      'aadasd',
      'asdasf-ff',
      '1112-3323',
      '-adad-d',
    ])
    expect(selectedQuestion.length).toBe(0)
  })

  test('should return correct question selectios with correction tree selections', () => {
    const selectedQuestions = treeValuesToQuestionChoices([
      '1_0',
      '1_1',
      '2_0',
      '2_6',
    ])
    expect(selectedQuestions.length).toBe(2)
    expect(selectedQuestions).toStrictEqual([
      {
        questionId: 1,
        choiceIds: [0, 1],
      },
      {
        questionId: 2,
        choiceIds: [0, 6],
      },
    ])
  })
})

describe('Func questionChoicesToTreeValues', () => {
  test('should return empty when no selected question choices are present', () => {
    const treeSelectedValues = questionChoicesToTreeValues([])
    expect(treeSelectedValues.length).toBe(0)
  })

  test('should return correct tree selected format for selectred question choices', () => {
    const treeSelectedValues = questionChoicesToTreeValues([
      {
        questionId: 1,
        choiceIds: [0, 1],
      },
      {
        questionId: 2,
        choiceIds: [0, 6],
      },
    ])
    expect(treeSelectedValues.length).toBe(4)
    expect(treeSelectedValues).toStrictEqual(['1_0', '1_1', '2_0', '2_6'])
  })
})
