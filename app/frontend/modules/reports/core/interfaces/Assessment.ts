import { Factor } from './Factor'
import { CampaignFactor } from '~/components/CampaignFactorsForm'

export interface Assessment {
  campaignFactorsList: CampaignFactor[]
  factors: Factor[]
  dimensionId: number
}
