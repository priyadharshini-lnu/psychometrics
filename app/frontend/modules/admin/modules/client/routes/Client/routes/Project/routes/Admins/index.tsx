import React, { FC } from 'react'

import { Admins as ProjectAdmins } from 'modules/admin/modules/Admins'

import { ParentResourceType } from 'modules/admin/modules/Admins/constants'

export const Admins: FC = () => (
  <ProjectAdmins parentResourceType={ParentResourceType.Project} />
)
