import { FC } from 'react'

import { Admins as ThreeSixtyAdmins } from '~/modules/admin/modules/Admins'

import { AdminTypes, CampaignTypes } from '~/modules/admin/modules/Admins/constants'

export const Admins: FC = () => (
  <ThreeSixtyAdmins adminType={AdminTypes.CampaignAdmin} campaignType={CampaignTypes.threesixty} />
)
