import { flatMap, uniqBy } from 'lodash'
import { Question } from './types'

export const transformQuestionsToAssessments = (
  questions?: Question[],
) => {
  if (!questions) {
    return {}
  }

  return questions.reduce((acc, question) => {
    const { assessmentId, assessmentName } = question

    if (!acc[assessmentId]) {
      acc[assessmentId] = {
        id: assessmentId,
        name: assessmentName,
        questions: [],
      }
    }

    acc[assessmentId].questions.push(question)
    return acc
  }, {} as Record<string, { id: string; name: string; questions: Question[] }>)
}

export const transformAssessmentsToQuestions = (
  assessments: Record<string, { assessment: string; questions: string[] }> = {},
): Array<{ assessmentId: string; id: string }> => {
  const allQuestions = flatMap(
    Object.values(assessments),
    (assessment) => {
      if (assessment?.assessment && assessment?.questions) {
        return assessment.questions.map((id: string) => ({
          assessmentId: assessment.assessment,
          id,
        }))
      }
      return []
    },
  )

  // Deduplicate by question id to prevent duplicate dependencies
  return uniqBy(allQuestions, 'id')
}
