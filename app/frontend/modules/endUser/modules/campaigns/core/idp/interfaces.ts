import * as t from 'io-ts'

export const ReflectionQuestionTR = t.type({
  id: t.string,
  question: t.string,
  answer: t.union([t.string, t.null]),
  mandatory: t.boolean,
  minWords: t.union([t.number, t.null]),
  maxWords: t.union([t.number, t.null]),
})

export type ReflectionQuestion = t.TypeOf<typeof ReflectionQuestionTR>

export const UpdateReflectionQuestionsResponseTR = t.type({
  data: t.array(ReflectionQuestionTR),
})

export type UpdateReflectionQuestionsResponse = t.TypeOf<typeof UpdateReflectionQuestionsResponseTR>
