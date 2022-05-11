import * as t from 'io-ts'
import { ResourceIdentifierTR } from './resource'

export const ClientTR = t.intersection([
  ResourceIdentifierTR,
  t.type({
    name: t.string,
    type: t.string,
    year: t.number,
    country: t.string,
    accountManager: t.union([
      t.type({
        id: t.string,
        name: t.string,
      }),
      t.undefined]),
    projectManager: t.union([
      t.type({
        id: t.string,
        name: t.string,
      }),
      t.undefined]),
  }),
])

export type Client = t.TypeOf<typeof ClientTR>
