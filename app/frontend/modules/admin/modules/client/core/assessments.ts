import * as t from 'io-ts'
import ApiAction from 'interfaces/ApiAction'
import { UploadFile } from 'antd/es/upload/interface'
import { createReducer } from '~/utils/redux'

export const ExternalSettingsTR = t.type({
  assessmentId: t.union([t.string, t.null, t.undefined]),
  normId: t.union([t.string, t.null, t.undefined]),
  scheduleConfig: t.union([t.string, t.null, t.undefined]),
  questionMappings: t.union([t.string, t.null, t.undefined]),
  assessmentName: t.union([t.string, t.null, t.undefined]),
  normName: t.union([t.string, t.null, t.undefined]),
})
export type ExternalSettings = t.TypeOf<typeof ExternalSettingsTR>

export const AssessmentTR = t.type({
  id: t.string,
  name: t.string,
  disabled: t.boolean,
  archived: t.boolean,
  deleted: t.boolean,
  defaultLanguage: t.string,
  iconUrl: t.union([t.string, t.null, t.undefined]),
  iconColor: t.union([t.string, t.null, t.undefined]),
  type: t.string,
  category: t.string,
  timing: t.union([t.string, t.null]),
  status: t.union([t.string, t.null]),
  createdAt: t.union([t.string, t.null]),
  updatedAt: t.union([t.string, t.null]),
  createdBy: t.union([t.string, t.null]),
  modifiedBy: t.union([t.string, t.null]),
  enableVideoCheck: t.union([t.boolean, t.null]),
  enableAudioCheck: t.union([t.boolean, t.null]),
  enableNetworkCheck: t.union([t.boolean, t.null]),
  translationsMigrated: t.union([t.boolean, t.null]),
  externalSettings: ExternalSettingsTR,
  icon: t.union([t.string, t.null]),
  tagList: t.array(t.union([t.string, t.null])),
  poster: t.union([t.string, t.null]),
  dimension: t.union([
    t.type({
      id: t.string,
      name: t.string,
    }),
    t.undefined]),
  owner: t.union([
    t.type({
      id: t.string,
      name: t.string,
    }),
    t.undefined]),
  project: t.union([
    t.type({
      id: t.string,
      name: t.string,
    }),
    t.undefined]),
  meta: t.type({
    permissions: t.type({
      manage: t.boolean,
      exportRawResults: t.boolean,
      exportRawFactorScores: t.boolean,
      exportNormedResults: t.boolean,
      externalScores: t.boolean,
    }),
  }),
  linkedAssessment: t.union([
    t.type({
      id: t.string,
      name: t.string,
    }),
    t.undefined, t.null]),
  questions: t.union([
    t.array(t.type({
      id: t.string,
      name: t.string,
    })),
    t.undefined]),
})


export type Assessment = t.TypeOf<typeof AssessmentTR>
export type LinkedAssessment = {
  id: string
  name: string
}

export const CATEGORIES = [
  'psychometric',
  'organisational',
  'case_study',
  'threesixty',
  'assessor_form',
  'lead_assessor_form',
  'agile',
  'hogan',
  'saville',
  'pearson',
  'iiht',
  'meeting',
  'mhs',
]

export const UPDATABLE_CATEGORIES = [
  'psychometric',
  'organisational',
  'case_study',
  'meeting',
]

export const CREATABLE_CATEGORIES = [
  ...UPDATABLE_CATEGORIES,
  'agile',
  'threesixty',
  'assessor_form',
  'lead_assessor_form',
]


export const TYPES = [
  'common',
  'hogan',
  'iiht',
  'pearson',
  'saville',
  'mettl',
  'mhs',
  'simulation',
  'skillvue',
  'yoodli',
  'microsite',
]

export const Schema = {
  type: 'assessments',
  relationships: {
    owner: {
      type: 'clients',
    },
    project: {
      type: 'clients',
    },
    dimension: {
      type: 'dimensions',
    },
    linkedAssessment: {
      type: 'assessments',
    },
    questions: {
      type: 'questions',
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

export const UPLOAD_FILES = 'resource/assessments/UPLOAD_FILES'

export const uploadFiles = (id: string, data: FormData): ApiAction<void> => ({
  type: UPLOAD_FILES,
  request: {
    method: 'put',
    contentType: 'multipart/form-data;',
    url: `/api/v2/administration/assessments/${id}/uploads`,
    body: data,
  },
})


export const reducer = createReducer({}, null)
