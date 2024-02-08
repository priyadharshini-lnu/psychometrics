import * as t from 'io-ts'

export const AdminRoleTR = t.type({
  id: t.string,
  name: t.string,
  description: t.string,
  permissions: t.union([
    t.type({ field: t.union([t.string, t.undefined]) }),
    t.null]),
})

export type AdminRole = t.TypeOf<typeof AdminRoleTR>

export const Schema = {
  type: 'admin_roles',
  relationships: {
    user: {
      type: 'users',
    },
  },
}
