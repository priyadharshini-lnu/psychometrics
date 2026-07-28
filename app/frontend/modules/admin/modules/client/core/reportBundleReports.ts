import * as t from 'io-ts'

export const ReportBundleReportTR = t.type({
  id: t.string,
  reportId: t.string,
  bundleName: t.string,
  name: t.string,
  ownerName: t.union([t.string, t.null]),
  externalPackageId: t.union([t.string, t.null]),
  createdAt: t.union([t.string, t.null]),
  updatedAt: t.union([t.string, t.null]),
  meta: t.type({
    permissions: t.type({
      manage: t.boolean,
    }),
  }),
})

export type ReportBundleReport = t.TypeOf<typeof ReportBundleReportTR>

export const Schema = {
  type: 'report_families_reports',
  relationships: {
    report: {
      type: 'reports',
    },
  },
}
