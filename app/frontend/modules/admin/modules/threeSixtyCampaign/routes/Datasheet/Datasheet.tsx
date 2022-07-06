import React from 'react'

import { DatasheetTabs } from 'modules/admin/modules/DatasheetManagement'

import { ParentResourceType } from 'modules/admin/modules/DatasheetManagement/interfaces'

const Datasheet = () => (
  <DatasheetTabs parentResourceType={ParentResourceType.Campaign} />
)

export default Datasheet
