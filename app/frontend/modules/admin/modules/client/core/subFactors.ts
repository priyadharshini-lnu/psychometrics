import * as t from 'io-ts'

export const SubFactorsTR = t.type({
  id: t.string,
  name: t.union([t.string, t.undefined]),
  factorName: t.union([t.string, t.undefined, t.null]),
  condition: t.union([t.string, t.undefined]),
  predicate: t.union([t.string, t.undefined]),
  value: t.union([t.string, t.number, t.undefined]),
  position: t.union([t.string, t.number, t.undefined, t.null]),
  createdAt: t.union([t.string, t.undefined]),
  updatedAt: t.union([t.string, t.undefined]),
  factorId: t.union([t.string, t.undefined, t.number]),
})

export type SubFactors = t.TypeOf<typeof SubFactorsTR>
