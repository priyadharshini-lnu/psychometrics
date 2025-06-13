import * as t from 'io-ts'
import { ResourceIdentifierTR } from '~/modules/admin/core/types/resource'

export const ReflectionQuestionTR = t.intersection([
  ResourceIdentifierTR,
  t.type({
    question: t.union([t.string, t.null]),
    project: t.union([
      t.type({
        id: t.string,
      }),
      t.undefined]),
    mandatory: t.boolean,
    allowDelete: t.union([t.boolean, t.undefined]),
    minWords: t.union([t.number, t.null]),
    maxWords: t.union([t.number, t.null]),
    updatedAt: t.union([t.string, t.null]),
  })])

export type ReflectionQuestion = t.TypeOf<typeof ReflectionQuestionTR>

export const Schema = {
  type: 'reflection_questions',
  relationships: {
    project: {
      type: 'clients',
    },
  },
}
