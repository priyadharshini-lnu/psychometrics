import * as t from 'io-ts'

export const IdpTR = t.type({
  id: t.string,
  name: t.string,
  description: t.string,
  // self_rating: t.boolean,
})

export type Idp = t.TypeOf<typeof IdpTR>
