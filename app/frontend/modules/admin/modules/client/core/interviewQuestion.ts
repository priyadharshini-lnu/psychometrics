import * as t from 'io-ts'
import { ResourceIdentifierTR } from '~/modules/admin/core/types/resource'

export const InterviewQuestionTR = t.intersection([
  ResourceIdentifierTR,
  t.type({
    question: t.union([t.string, t.null]),
    description: t.union([t.string, t.null]),
    mandatory: t.boolean,
    timeLimit: t.union([t.number, t.null]),
    questionType: t.union([t.literal('audio'), t.literal('video')]),
    allowDelete: t.boolean,
    tagList: t.union([t.array(t.string), t.null]),
    updatedAt: t.union([t.string, t.null]),
    project: t.union([
      t.type({
        id: t.string,
      }),
      t.undefined]),
  })])

export type InterviewQuestion = t.TypeOf<typeof InterviewQuestionTR>

export const Schema = {
  type: 'interview_questions',
  relationships: {
    project: {
      type: 'clients',
    },
  },
}
