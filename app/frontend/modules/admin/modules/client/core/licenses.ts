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
  type: t.string,
  reportFamily: t.union([
    t.type({
      id: t.string,
      name: t.string,
    }),
    t.undefined]),
})
export const LicenseTypes = [
  'common', 'threesixty', 'proctoring',
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
