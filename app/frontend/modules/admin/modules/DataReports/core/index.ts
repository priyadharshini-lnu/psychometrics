import * as t from 'io-ts'

export const DataReportTR = t.type({
  id: t.string,
  name: t.string,
  updatedAt: t.string,
  configuration: t.union([t.string, t.null]),
  reportType: t.string,
  scope: t.string,
  owner: t.union([
    t.type({
      id: t.string,
      name: t.string,
    }),
    t.null,
    t.undefined,
  ]),
  lastUpdatedBy: t.union([
    t.type({
      id: t.string,
      name: t.string,
      email: t.string,
    }),
    t.undefined]),
})

export const OkResponse = t.string

export const DataReportJobTR = t.type({
  id: t.string,
  status: t.string,
  createdAt: t.string,
  password: t.union([t.string, t.null, t.undefined]),
  file: t.union([t.string, t.null]),
})

export const PasswordTR = t.type({
  password: t.string,
})
export type Password = t.TypeOf<typeof PasswordTR>

export type DataReportJob = t.TypeOf<typeof DataReportJobTR>

export type DataReport = t.TypeOf<typeof DataReportTR>

export const Schema = {
  type: 'data_reports',
  fields: {

  },
  relationships: {
    owner: {
      type: 'clients',
    },
    lastUpdatedBy: {
      type: 'users',
    },
  },
}

export const JobSchema = {
  type: 'data_reports',
  fields: {

  },
  relationships: {
    created_by: {
      type: 'users',
    },
  },
}
