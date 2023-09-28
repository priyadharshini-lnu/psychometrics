import { FC } from 'react'

import { Admins as ProjectAdmins } from '~/modules/admin/modules/Admins'

import { AdminTypes } from '~/modules/admin/modules/Admins/constants'

export const Admins: FC = () => (
  <ProjectAdmins adminType={AdminTypes.ProjectAdmin} />
)
