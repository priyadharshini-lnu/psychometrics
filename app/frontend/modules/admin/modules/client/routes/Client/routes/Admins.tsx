import { FC } from 'react'

import { Admins as ClientAdmins } from '~/modules/admin/modules/Admins'

import { AdminTypes } from '~/modules/admin/modules/Admins/constants'

export const Admins: FC = () => (
  <ClientAdmins adminType={AdminTypes.ClientAdmin} />
)
