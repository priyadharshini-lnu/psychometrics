import * as t from 'io-ts'
import { ResourceIdentifierTR } from './resource'


export const UserProfileTR = t.type({
  id: t.string,
  userId: t.number,
  age: t.union([t.number, t.null]),
  timezone: t.union([t.string, t.null]),
  locale: t.union([t.string, t.null]),
  gender: t.union([t.string, t.null]),
  photoUrl: t.union([t.string, t.null]),
})


export const UserTR = t.intersection([
  ResourceIdentifierTR,
  t.type({
    name: t.string,
    email: t.string,
  }),
])

export type User = t.TypeOf<typeof UserTR>
export type UserProfile = t.TypeOf<typeof UserProfileTR>
