import * as t from 'io-ts'
import { ResourceIdentifierTR } from './resource'

export const ClientTR = t.intersection([
  ResourceIdentifierTR,
  t.type({
    name: t.string,
    type: t.string,
    year: t.number,
    country: t.string,
  }),
])

export type Client = t.TypeOf<typeof ClientTR>
