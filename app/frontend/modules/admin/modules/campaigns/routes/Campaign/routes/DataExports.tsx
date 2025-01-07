import { FC } from 'react'

import { DataExports as CampaignDataExports } from '~/modules/admin/modules/DataExports'
import { AdminTypes, CampaignTypes } from '~/modules/admin/modules/Admins/constants'


export const DataExports: FC = () => (
  <CampaignDataExports adminType={AdminTypes.CampaignAdmin} campaignType={CampaignTypes.common} />
)
