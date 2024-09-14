import {
  questionChoicesToTableValues
} from '~/modules/reports/components/modules/Table/components/Types/Competencies/Types/Question'

vi.mock('~/modules/reports/store/I18nStore', () => ({
  default: {
    tQuestion: vi.fn(() => 'Question'),
  }
}))

describe('Func questionChoicesToTableValues', () => {
  test('should return empty if no question choices exists for an assessment', () => {
    const emptyQuestionChoices = []
    const filteredQuestionChoicesWithEmptyQuestionChoices =
      questionChoicesToTableValues(emptyQuestionChoices)

    expect(
      filteredQuestionChoicesWithEmptyQuestionChoices.length
    ).toStrictEqual(0)
  })

  test('should return correct table structure for given question choices', () => {
    const questionChoices = [
      {
        questionId: 1,
        choiceIds: [1, 2, 3],
      },
      {
        questionId: 2,
        choiceIds: [2, 6],
      },
    ]
    const allQuestions = {
      1: {
        id: 1,
      },
      2: {
        id: 2,
      },
    }

    const filteredQuestionChoices = questionChoicesToTableValues(
      questionChoices,
      allQuestions
    )

    expect(filteredQuestionChoices.length).toStrictEqual(5)
    expect(filteredQuestionChoices[1]).toHaveProperty('questionId')
    expect(filteredQuestionChoices[1]).toHaveProperty('choiceId')
    expect(filteredQuestionChoices[1]).toHaveProperty('name')

    expect(filteredQuestionChoices[0]).toMatchObject({
        questionId: 1,
        choiceId: 1,
        name: 'Question',
    })
    expect(filteredQuestionChoices[3]).toMatchObject({
        questionId: 2,
        choiceId: 2,
        name: 'Question',
    })
  })
})
