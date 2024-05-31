import { useParams } from 'react-router-dom'
import { SheetType } from '~/modules/admin/modules/SheetManagement/core/list'
import { Sheet } from '~/modules/admin/modules/SheetManagement/Sheet'
import { ParentResourceType } from '~/modules/admin/modules/SheetManagement/interfaces'

export const Accesssheet = () => {
  const { campaignId } = useParams() as { campaignId: string }
  const parsedCampaignId = parseInt(campaignId, 10)

  return (
    <Sheet
      parentResourceType={ParentResourceType.Campaign}
      parentResourceId={parsedCampaignId}
      sheetType={SheetType.Accesssheet}
    />
  )
}
