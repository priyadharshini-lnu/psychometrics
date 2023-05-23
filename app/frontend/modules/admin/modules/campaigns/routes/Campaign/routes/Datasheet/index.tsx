import { SheetTabs } from '~/modules/admin/modules/SheetManagement'

import { ParentResourceType } from '~/modules/admin/modules/SheetManagement/interfaces'

export const Datasheet = () => (
  <SheetTabs parentResourceType={ParentResourceType.Campaign} />
)
