import * as t from 'io-ts'

export const CampaignIdpTR = t.type({
  id: t.string,
  idpTemplate: t.type({
    id: t.string,
    name: t.string,
  }),
  dependenciesAttributes: t.type({
    questions: t.array(t.type({
      id: t.string,
      assessmentId: t.string,
      name: t.string,
      assessmentName: t.string,
    })),
  }),
  idpAssistantDependencies: t.array(t.string),
})

export type CampaignIdp = t.TypeOf<typeof CampaignIdpTR>

export const Schema = {
  type: 'campaign_idps',
  relationships: {
    campaign: {
      type: 'campaigns',
    },
    idpTemplate: {
      type: 'idp_templates',
    },
  },
}
