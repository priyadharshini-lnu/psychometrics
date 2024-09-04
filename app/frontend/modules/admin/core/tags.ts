import * as t from 'io-ts'

export const TagTR = t.type({
  id: t.string,
  name: t.string,
})


export type Tag = t.TypeOf<typeof TagTR>
