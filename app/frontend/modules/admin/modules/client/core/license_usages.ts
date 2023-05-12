import * as t from 'io-ts'

export const LicenseUsageTR = t.type({
  id: t.string,
  createdAt: t.string,
  extras: t.union([
    t.type({ field: t.union([t.string, t.undefined]) }),
    t.undefined]),
  statusUpdatedAt: t.union([t.string, t.null]),
  status: t.union([t.string, t.null]),
})

export type LicenseUsage = t.TypeOf<typeof LicenseUsageTR>

export const Schema = {
  type: 'license_usages',
  relationships: {
    user: {
      type: 'users',
    },
    status_updated_by: {
      type: 'users',
    },
  },
}
