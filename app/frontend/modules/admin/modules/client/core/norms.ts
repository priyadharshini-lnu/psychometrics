import * as t from 'io-ts'

export const NormTR = t.type({
  id: t.string,
  name: t.string,
  disabled: t.boolean,
  createdAt: t.string,
  updatedAt: t.string,
  normType: t.string,
  meta: t.type({
    permissions: t.type({
      edit: t.boolean,
      copy: t.boolean,
      delete: t.boolean,
      export: t.boolean,
      editor: t.boolean,
    }),
  }),

  dimension: t.union([
    t.type({
      id: t.string,
      name: t.string,
    }),
    t.undefined,
  ]),

  owner: t.union([
    t.type({
      id: t.string,
      name: t.string,
    }),
    t.undefined,
  ]),

  updatedBy: t.union([
    t.type({
      id: t.string,
      name: t.string,
    }),
    t.undefined,
  ]),
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
