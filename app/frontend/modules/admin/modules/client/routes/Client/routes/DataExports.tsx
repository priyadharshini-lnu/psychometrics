import { FC } from 'react'

import { DataExports as ClientDataExports } from '~/modules/admin/modules/DataExports'

import { AdminTypes } from '~/modules/admin/modules/Admins/constants'

export const DataExports: FC = () => (
  <ClientDataExports adminType={AdminTypes.ClientAdmin} />
)
