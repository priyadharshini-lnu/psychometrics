import * as t from 'io-ts'

export type Admin = t.TypeOf<typeof AdminTR>

const AdminInfoTR = {
  id: t.union([t.null, t.number]),
  userId: t.union([t.null, t.number]),
  firstName: t.union([t.null, t.string]),
  lastName: t.union([t.null, t.string]),
  email: t.string,
  createdAt: t.union([t.null, t.string]),
  permissions: t.type({
    loginAs: t.boolean,
    edit: t.boolean,
    remove: t.boolean,
    resetPassword: t.boolean,
    sendMail: t.boolean,
  }),
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const AdminTR = t.type({
  ...AdminInfoTR,
})

export type AvailablePermissions = Record<string, string[]>
