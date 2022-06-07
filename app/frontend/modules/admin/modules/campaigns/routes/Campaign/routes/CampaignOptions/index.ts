import withSkeleton from 'modules/admin/hoc/withSkeleton'

import { FETCH } from 'modules/admin/modules/campaigns/core/campaignOptions'

import CampaignOptions from './CampaignOptions'

export default withSkeleton(CampaignOptions, FETCH)
