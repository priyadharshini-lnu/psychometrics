import * as t from 'io-ts'

export const CampaignIdpTR = t.type({
  id: t.string,
  idpTemplate: t.type({
    id: t.string,
    name: t.string,
  }),
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
