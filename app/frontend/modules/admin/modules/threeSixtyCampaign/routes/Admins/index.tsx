import React, { FC } from 'react'

import { Admins as ThreeSixtyAdmins } from 'modules/admin/modules/Admins'

import { ParentResourceType } from 'modules/admin/modules/Admins/constants'

export const Admins: FC = () => (
  <ThreeSixtyAdmins parentResourceType={ParentResourceType.Campaign} />
)
