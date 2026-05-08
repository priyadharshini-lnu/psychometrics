import * as t from 'io-ts'
import { ResourceIdentifierTR } from '~/modules/admin/core/types/resource'

export const BlockTR = t.intersection([
  ResourceIdentifierTR,
  t.type({
    name: t.string,
    blockType: t.string,
    position: t.union([t.number, t.null]),
    props: t.union([t.record(t.string, t.unknown), t.null]),
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
    template: t.union([
      t.type({
        id: t.string,
        name: t.union([t.string, t.undefined]),
      }),
      t.null,
      t.undefined,
    ]),
    questions: t.union([
      t.array(t.type({
        id: t.string,
        name: t.union([t.string, t.undefined]),
      })),
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
  }),
])

export type Block = t.TypeOf<typeof BlockTR>

export const Schema = {
  type: 'blocks',
  relationships: {
    owner: {
      type: 'clients',
    },
    template: {
      type: 'blocks',
    },
    questions: {
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
