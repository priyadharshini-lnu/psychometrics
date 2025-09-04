import { useState } from 'react'
import { useAppSelector } from '~/modules/endUser/store/hooks'
import {
  useUpdateReflectionQuestionsMutation,
} from '~/modules/endUser/modules/campaigns/core/idp/api'
import { getReflectiveQuestions } from '~/modules/endUser/modules/campaigns/core/idp/idpPlanRtk'

const { I18n } = window

export const useReflectiveQuestions = () => {
  const reflectionQuestions = useAppSelector(getReflectiveQuestions)

  const [updateReflectionQuestions] = useUpdateReflectionQuestionsMutation()

  const [answers, setAnswers] = useState<Record<number, {content: string, wordsCount?: number}>>(
    reflectionQuestions.reduce((acc, question) => ({
      ...acc, [question.id]: { content: question.answer || '' },
    }), {}),
  )
  const [errors, setErrors] = useState<Record<number, string[]>>({})

  const onChange = (questionId, content, wordsCount) => {
    setAnswers(prevAnswers => ({
      ...prevAnswers,
      [questionId]: { content, wordsCount },
    }))
    setErrors(prevErrors => ({
      ...prevErrors,
      [questionId]: [],
    }))
  }

  const validateAnswer = (question) => {
    const answer = answers[question.id]
    setErrors(prevErrors => ({ ...prevErrors, [question.id]: [] }))

    if (question.mandatory && !answer.content) {
      setErrors(prevErrors => ({
        ...prevErrors,
        [question.id]: [...(prevErrors[question.id] || []), I18n.t('idp.reflective_questions.errors.required')],
      }))
      return false
    }
    if (answer.content && question.minWords && answer.wordsCount && answer.wordsCount < question.minWords) {
      setErrors(prevErrors => ({
        ...prevErrors,
        [question.id]: [
          ...(prevErrors[question.id] || []),
          I18n.t('idp.reflective_questions.errors.min_words', { count: question.minWords }),
        ],
      }))
      return false
    }
    if (question.maxWords && answer.wordsCount && answer.wordsCount > question.maxWords) {
      setErrors(prevErrors => ({
        ...prevErrors,
        [question.id]: [
          ...(prevErrors[question.id] || []),
          I18n.t('idp.reflective_questions.errors.max_words', { count: question.maxWords }),
        ],
      }))
      return false
    }
    return true
  }

  return {
    validateAnswer,
    onChange,
    errors,
    answers,
    reflectionQuestions,
    updateReflectionQuestions,
  }
}
