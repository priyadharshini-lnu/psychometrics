import * as t from 'io-ts'
import ApiAction from 'interfaces/ApiAction'

export const CAMPAIGN_BY_ASSESSMENT_ID = 'campaigns/CAMPAIGN_BY_ASSESSMENT_ID'
export const FACTORS_BY_ASSESSMENT_ID = 'campaigns/FACTORS_BY_ASSESSMENT_ID'

export const FactorTR = t.type({
  id: t.string,
  name: t.union([t.string, t.undefined]),
  parent: t.union([t.boolean, t.undefined]),
  disabled: t.union([t.boolean, t.undefined]),
  active: t.union([t.boolean, t.undefined]),
  subFactors: t.union([t.array(t.type({
    id: t.string,
    name: t.string,
  })), t.undefined]),
  parent_factors: t.union([t.array(t.type({
    id: t.string,
    name: t.string,
  })), t.undefined]),
  parentFactors: t.union([t.array(t.type({
    id: t.string,
    name: t.string,
  })), t.undefined]),
  iconUrl: t.union([t.string, t.null, t.undefined]),
  questionsCount: t.union([t.number, t.undefined]),
  questionsCountByAssessmentDetails: t.union([
    t.array(t.type({
      assessmentId: t.number,
      assessmentName: t.union([t.string, t.null, t.undefined]),
      count: t.number,
    })),
    t.undefined,
  ]),
  scoringStrategy: t.union([t.string, t.undefined]),
  createdAt: t.union([t.string, t.undefined]),
  updatedAt: t.union([t.string, t.undefined]),
  meta: t.union([
    t.type({
      permissions: t.type({
        copy: t.boolean,
      }),
    }),
    t.undefined,
  ]),
})


export const FactorSearchTR = t.type({
  id: t.string,
  name: t.string,
  parent: t.boolean,
  disabled: t.boolean,
})

export type Factor = t.TypeOf<typeof FactorTR>

export const fetchByAssessmentId = (assessmentId: number): ApiAction<Factor[]> => ({
  type: CAMPAIGN_BY_ASSESSMENT_ID,
  request: {
    method: 'get',
    url: `/administration/assessments/${assessmentId}/factors`,
  },
})

export const Schema = {
  type: 'factors',
  relationships: {
    sub_factors: {
      type: 'factors_sub_factors',
    },
    dimension: {
      type: 'dimensions',
    },
  },
}

export const UPLOAD_FILES = 'resource/factors/UPLOAD_FILES'

export const uploadFiles = (dimensionId: string, id: string, data: FormData): ApiAction<void> => ({
  type: UPLOAD_FILES,
  request: {
    method: 'put',
    contentType: 'multipart/form-data;',
    url: `/api/v2/administration/dimensions/${dimensionId}/factors/${id}/uploads`,
    body: data,
  },
})
