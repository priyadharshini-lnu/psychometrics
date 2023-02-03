import React, { FC } from 'react'

import { Admins as ThreeSixtyAdmins } from '~/modules/admin/modules/Admins'

import { AdminTypes } from '~/modules/admin/modules/Admins/constants'

export const Admins: FC = () => (
  <ThreeSixtyAdmins adminType={AdminTypes.CampaignAdmin} />
)
