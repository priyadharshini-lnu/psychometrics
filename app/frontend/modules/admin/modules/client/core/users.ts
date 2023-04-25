import * as t from 'io-ts'

export const UserTR = t.type({
  id: t.string,
  name: t.string,
  fullName: t.string,
  firstName: t.union([t.string, t.null]),
  lastName: t.union([t.string, t.null]),
  email: t.string,
  role: t.string,
  disabled: t.boolean,
  enable_2fa: t.boolean,
  updatedAt: t.union([t.string, t.null]),
  createdBy: t.union([t.string, t.null]),
  modifiedBy: t.union([t.string, t.null]),
  meta: t.type({
    permissions: t.type({
      remove: t.boolean,
      resetPassword: t.boolean,
      toggleEnable2fa: t.boolean,
    }),
  }),
})

export const UserDetailsTR = t.type({
  id: t.string,
  name: t.string,
  firstName: t.string,
  lastName: t.string,
  email: t.string,
})

export type UserDetails = t.TypeOf<typeof UserDetailsTR>
export type User = t.TypeOf<typeof UserTR>
