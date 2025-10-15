import * as t from 'io-ts'

export const LicenseTR = t.type({
  id: t.string,
  number: t.number,
  overuseNumber: t.number,
  usedNumber: t.number,
  clientId: t.number,
  startDate: t.string,
  endDate: t.string,
  disabled: t.boolean,
  enabled: t.boolean,
  type: t.string,
  reportFamily: t.union([
    t.type({
      id: t.string,
      name: t.string,
    }),
    t.undefined]),
  projectLicenseDetails: t.union([
    t.type({
      id: t.number,
      enabled: t.boolean,
      usageLimit: t.number,
      usedNumber: t.number,
    }),
    t.null,
  ]),
})
export const LicenseTypes = [
  'common', 'threesixty', 'proctoring', 'idp',
]

export type License = t.TypeOf<typeof LicenseTR>

export const Schema = {
  type: 'licenses',
  relationships: {
    reportFamily: {
      type: 'report_families',
    },
  },
}
