import { FC } from 'react'

import { Admins as CampaignAdmins } from '~/modules/admin/modules/Admins'
import { AdminTypes, CampaignTypes } from '~/modules/admin/modules/Admins/constants'

export const Admins: FC = () => (
  <CampaignAdmins adminType={AdminTypes.CampaignAdmin} campaignType={CampaignTypes.common} />
)
