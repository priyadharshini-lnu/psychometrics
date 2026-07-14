import * as t from 'io-ts'

export const DimensionTR = t.type({
  id: t.string,
  name: t.string,
  disabled: t.boolean,
  owner: t.union([
    t.type({
      id: t.string,
      name: t.string,
    }),
    t.undefined,
  ]),
  occupationsEnabled: t.boolean,
  innovationStylesEnabled: t.boolean,
  defaultOccupationConditionSetId: t.union([t.number, t.null, t.undefined]),
  createdAt: t.union([t.string, t.undefined]),
  updatedAt: t.union([t.string, t.undefined]),
  meta: t.union([
    t.type({
      permissions: t.type({
        copy: t.boolean,
        exportJson: t.boolean,
      }),
    }),
    t.undefined,
  ]),
})

export const Schema = {
  type: 'dimensions',
  relationships: {
    owner: {
      type: 'clients',
    },
  },
}


export type Dimension = t.TypeOf<typeof DimensionTR>
