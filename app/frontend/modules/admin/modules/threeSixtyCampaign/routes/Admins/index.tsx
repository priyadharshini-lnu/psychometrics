import { FC } from 'react'
import { Admins as ThreeSixtyAdmins } from '~/modules/admin/modules/Admins'
import { AdminTypes, CampaignTypes } from '~/modules/admin/modules/Admins/constants'
import { PageHeader } from '../../PageHeader'

export const Admins: FC = () => (
  <>
    <PageHeader />
    <ThreeSixtyAdmins adminType={AdminTypes.CampaignAdmin} campaignType={CampaignTypes.threesixty} />
  </>
)
