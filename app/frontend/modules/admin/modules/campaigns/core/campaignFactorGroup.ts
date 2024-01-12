export const Schema = {
  type: 'campaign_factor_groups',
  relationships: {
    campaign: {
      type: 'campaigns',
      id: 'string',
    },
    campaignFactors: {
      type: 'campaign_factors',
    },
  },
}

export const UpdatePositionsSchema = {
  type: 'update_positions',
  relationships: {
    campaign: {
      type: 'campaigns',
      id: 'string',
    },
    campaignFactorGroup: {
      type: 'campaign_factor_groups',
      id: 'string',
    },
  },
}

export const CampaignFactorsSchema = {
  type: 'campaign_factors',
  relationships: {
    campaign: {
      type: 'campaigns',
      id: 'string',
    },
    campaignFactorGroup: {
      type: 'campaign_factor_groups',
      id: 'string',
    },
  },
}
