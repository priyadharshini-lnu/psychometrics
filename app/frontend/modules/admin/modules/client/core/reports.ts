import * as t from 'io-ts'
import ApiAction from 'interfaces/ApiAction'
import { UploadFile } from 'antd/es/upload/interface'
import { createReducer } from '~/utils/redux'

export const ReportBundleTR = t.type({
  id: t.string,
  name: t.string,
  createdAt: t.union([t.string, t.null]),
  updatedAt: t.union([t.string, t.null]),
  clientId: t.union([t.string, t.number, t.null, t.undefined]),
  tenantName: t.union([t.string, t.null, t.undefined]),
  tenant: t.union([
    t.type({
      id: t.string,
      name: t.string,
    }),
    t.undefined,
    t.null,
  ]),
  meta: t.type({
    permissions: t.type({
      manage: t.boolean,
    }),
  }),
})

export type ReportBundle = t.TypeOf<typeof ReportBundleTR>

export const ExternalSettingsTR = t.type({
  reportId: t.union([t.string, t.null, t.undefined]),
  provider: t.union([t.string, t.null, t.undefined]),
})

export type ExternalSettings = t.TypeOf<typeof ExternalSettingsTR>

const HoganReportPackage = t.type({
  id: t.string,
  name: t.string,
})

const HoganReportPackagesTR = t.array(HoganReportPackage)

export type HoganReportPackages = t.TypeOf<typeof HoganReportPackagesTR>;

export const ReportTR = t.type({
  id: t.string,
  name: t.string,
  provider: t.string,
  description: t.union([t.string, t.null]),
  defaultLanguage: t.union([t.string, t.null]),
  disabled: t.boolean,
  archived: t.boolean,
  deleted: t.boolean,
  dataOnly: t.boolean,
  iconUrl: t.union([t.string, t.null, t.undefined]),
  iconColor: t.union([t.string, t.null, t.undefined]),
  createdAt: t.union([t.string, t.null]),
  updatedAt: t.union([t.string, t.null]),
  createdBy: t.union([t.string, t.null]),
  modifiedBy: t.union([t.string, t.null]),
  icon: t.union([t.string, t.null]),
  tagList: t.array(t.union([t.string, t.null])),
  poster: t.union([t.string, t.null]),
  externalSettings: ExternalSettingsTR,
  externalReport: t.boolean,
  hoganReportPackages: HoganReportPackagesTR,
  owner: t.union([
    t.type({
      id: t.string,
      name: t.string,
    }),
    t.undefined]),
  assessments: t.array(t.type({
    id: t.string,
    name: t.string,
    type: t.string,
  })),
  meta: t.type({
    permissions: t.type({
      manage: t.boolean,
    }),
  }),
})


export type Report = t.TypeOf<typeof ReportTR>

export const Schema = {
  type: 'reports',
  relationships: {
    owner: {
      type: 'clients',
    },
    assessments: {
      type: 'assessments',
      association: 'hasMany',
      singularName: 'assessment',
    },
  },
}

export const ReportBundleSchema = {
  type: 'report_families',
  relationships: {
    owner: {
      type: 'clients',
    },
  },
}

export type Files = {
  icon: {
    file?: File | UploadFile
  }
  poster: {
    file?: File | UploadFile
  }
}

export const UPLOAD_FILES = 'resource/reports/UPLOAD_FILES'

export const uploadFiles = (id: string, data: FormData): ApiAction<void> => ({
  type: UPLOAD_FILES,
  request: {
    method: 'put',
    contentType: 'multipart/form-data;',
    url: `/api/v2/administration/reports/${id}/uploads`,
    body: data,
  },
})


export const reducer = createReducer({}, null)
