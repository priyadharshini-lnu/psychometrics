import * as t from 'io-ts'

export const ClientAuditlogExportSettingtTR = t.type({
  id: t.string,
  description: t.union([t.string, t.null]),
  destinationType: t.string,
  active: t.boolean,
  s3AccessKeyId: t.union([t.string, t.null]),
  s3SecretAccessKey: t.union([t.string, t.null, t.undefined]),
  s3BucketName: t.union([t.string, t.null]),
  s3BucketFolder: t.union([t.string, t.null]),
  s3Region: t.union([t.string, t.null]),
  s3Endpoint: t.union([t.string, t.null]),
})


export type ClientAuditlogExportSetting = t.TypeOf<typeof ClientAuditlogExportSettingtTR>
