import * as t from 'io-ts'
import { ResourceIdentifierTR } from './resource'

export const UserTR = t.intersection([
  ResourceIdentifierTR,
  t.type({
    name: t.string,
  }),
])

export type User = t.TypeOf<typeof UserTR>
