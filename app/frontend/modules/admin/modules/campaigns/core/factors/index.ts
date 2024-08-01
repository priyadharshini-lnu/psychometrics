import * as t from 'io-ts'
import ApiAction from 'interfaces/ApiAction'

export const CAMPAIGN_BY_ASSESSMENT_ID = 'campaigns/CAMPAIGN_BY_ASSESSMENT_ID'
export const FACTORS_BY_ASSESSMENT_ID = 'campaigns/FACTORS_BY_ASSESSMENT_ID'

export const FactorTR = t.type({
  id: t.string,
  name: t.string,
  parent: t.boolean,
  sub_factors: t.array(t.type({
    id: t.string,
    name: t.string,
  })),
  parent_factors: t.array(t.type({
    id: t.string,
    name: t.string,
  })),
})

export type Factor = t.TypeOf<typeof FactorTR>

export const fetchByAssessmentId = (assessmentId: number): ApiAction<Factor[]> => ({
  type: CAMPAIGN_BY_ASSESSMENT_ID,
  request: {
    method: 'get',
    url: `/administration/assessments/${assessmentId}/factors`,
  },
})
