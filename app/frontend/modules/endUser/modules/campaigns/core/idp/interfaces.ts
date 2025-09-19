import * as t from 'io-ts'

export const ReflectionQuestionTR = t.type({
  id: t.string,
  question: t.string,
  answer: t.union([t.string, t.null]),
  mandatory: t.boolean,
  minWords: t.union([t.number, t.null]),
  maxWords: t.union([t.number, t.null]),
})

export const SkillResponseTR = t.type({
  data: t.type({
    id: t.union([t.string, t.number]),
    name: t.string,
    description: t.string,
    skillType: t.string,
    initialRating: t.union([t.number, t.null]),
    finalRating: t.union([t.number, t.null]),
    skillId: t.union([t.string, t.number]),
    private: t.boolean,
  }),
  message: t.string,
})

export type ReflectionQuestion = t.TypeOf<typeof ReflectionQuestionTR>

export const UpdateReflectionQuestionsResponseTR = t.type({
  data: t.array(ReflectionQuestionTR),
})

export type UpdateReflectionQuestionsResponse = t.TypeOf<typeof UpdateReflectionQuestionsResponseTR>
export type SkillResponse = t.TypeOf<typeof SkillResponseTR>
