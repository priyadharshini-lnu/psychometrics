import * as t from 'io-ts'
import { ResourceIdentifierTR } from '~/modules/admin/core/types/resource'

export const CampaignTemplateTR = t.intersection([
  ResourceIdentifierTR,
  t.type({
    name: t.string,
    createdAt: t.union([t.string, t.null]),
    updatedAt: t.union([t.string, t.null]),
    assessment: t.type({
      id: t.string,
      name: t.string,
    }),
    report: t.type({
      id: t.string,
      name: t.string,
    }),
    owner: t.union([
      t.type({
        id: t.string,
        name: t.string,
      }),
      t.undefined]),
    campaign: t.union([
      t.type({
        id: t.string,
        name: t.string,
      }),
      t.undefined]),
  })])

export type CampaignTemplate = t.TypeOf<typeof CampaignTemplateTR>


export const Schema = {
  type: 'campaign_templates',
  relationships: {
    owner: {
      type: 'clients',
    },
    assessment: {
      type: 'assessments',
    },
    report: {
      type: 'reports',
    },
    campaign: {
      type: 'campaigns',
    },
  },
}
