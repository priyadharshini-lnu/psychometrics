import * as t from 'io-ts'

export const IdpTemplateTR = t.type({
  id: t.string,
  name: t.string,
  description: t.string,
})


export type IdpTemplate = t.TypeOf<typeof IdpTemplateTR>
