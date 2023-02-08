import * as t from 'io-ts'
import { ResourceIdentifierTR } from './resource'

export const UserTR = t.intersection([
  ResourceIdentifierTR,
  t.type({
    name: t.string,
    firstName: t.string,
    lastName: t.string,
    email: t.string,
    role: t.string,
  }),
])

export const UserDetailsTR = t.type({
  id: t.string,
  name: t.string,
  firstName: t.string,
  lastName: t.string,
  email: t.string,
})

export type UserDetails = t.TypeOf<typeof UserDetailsTR>
export type User = t.TypeOf<typeof UserTR>
