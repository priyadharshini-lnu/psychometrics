import * as t from 'io-ts'

export const NormTR = t.type({
  id: t.string,
  name: t.string,
  disabled: t.boolean,
  description: t.union([t.string, t.null]),
  createdAt: t.string,
  updatedAt: t.string,
  meta: t.type({
    permissions: t.type({
      manage: t.boolean,
      exportRawResults: t.boolean,
      exportRawFactorScores: t.boolean,
      exportNormedResults: t.boolean,
    }),
  }),

  dimension: t.type({
    id: t.string,
    name: t.string,
  }),

  owner: t.type({
    id: t.string,
    name: t.string,
  }),

  updatedBy: t.type({
    id: t.string,
    name: t.string,
  }),
})

export type Norm = t.TypeOf<typeof NormTR>

export const Schema = {
  type: 'norms',
  relationships: {
    owner: {
      type: 'clients',
    },
    dimension: {
      type: 'dimensions',
    },
    updatedBy: {
      type: 'users',
    },
  },
}
