import * as t from 'io-ts'
import { ResourceIdentifierTR } from '~/modules/admin/core/types/resource'

export const QuestionTR = t.intersection([
  ResourceIdentifierTR,
  t.type({
    name: t.string,
    type: t.string,
    position: t.union([t.number, t.null]),
    props: t.union([t.record(t.string, t.unknown), t.null]),
    validation: t.union([t.record(t.string, t.unknown), t.null]),
    requiredValidation: t.union([t.record(t.string, t.unknown), t.null]),
    displayLogic: t.union([t.record(t.string, t.unknown), t.null]),
    skipLogic: t.union([t.array(t.record(t.string, t.unknown)), t.null]),
    templateId: t.union([t.string, t.null]),
    saveAsTemplate: t.union([t.boolean, t.null]),
    disabled: t.union([t.boolean, t.null]),
    owner: t.union([
      t.type({
        id: t.string,
        name: t.union([t.string, t.undefined]),
      }),
      t.null,
      t.undefined,
    ]),
    block: t.union([
      t.type({
        id: t.string,
        name: t.union([t.string, t.undefined]),
      }),
      t.null,
      t.undefined,
    ]),
    template: t.union([
      t.type({
        id: t.string,
        name: t.union([t.string, t.undefined]),
      }),
      t.null,
      t.undefined,
    ]),
    linkedAssessments: t.union([
      t.array(t.type({
        id: t.string,
        name: t.union([t.string, t.undefined]),
      })),
      t.null,
    ]),
    createdAt: t.union([t.string, t.null]),
    updatedAt: t.union([t.string, t.null]),
  }),
])

export type Question = t.TypeOf<typeof QuestionTR>

export const Schema = {
  type: 'questions',
  relationships: {
    owner: {
      type: 'clients',
    },
    block: {
      type: 'blocks',
    },
    template: {
      type: 'questions',
    },
    createdBy: {
      type: 'users',
    },
    updatedBy: {
      type: 'users',
    },
    linkedAssessments: {
      type: 'assessments',
    },
  },
}
