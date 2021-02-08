import React from 'react'

import { DatasheetManagement } from 'modules/admin/modules/DatasheetManagement'

import { ParentResourceType } from 'modules/admin/modules/DatasheetManagement/interfaces'

const Datasheet = () => (
  <DatasheetManagement parentResourceType={ParentResourceType.Campaign} />
)

export default Datasheet
