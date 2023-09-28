import * as t from 'io-ts'

export const CampaignAssessmentTR = t.type({
  id: t.string,
  assessment: t.type({
    id: t.string,
    name: t.string,
  }),
})

export const Schema = {
  type: 'campaign_assessments',
  relationships: {
    assessment: {
      type: 'assessments',
    },
  },
}

export type CampaignAssessment = t.TypeOf<typeof CampaignAssessmentTR>
