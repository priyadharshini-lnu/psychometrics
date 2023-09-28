import * as t from 'io-ts'

export const DimensionTR = t.type({
  id: t.string,
  name: t.string,
})


export type Dimension = t.TypeOf<typeof DimensionTR>
