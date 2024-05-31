import { useParams } from 'react-router-dom'
import { SheetType } from '~/modules/admin/modules/SheetManagement/core/list'
import { SheetSettings } from '~/modules/admin/modules/SheetManagement/SheetSettings'
import { ParentResourceType } from '~/modules/admin/modules/SheetManagement/interfaces'

export const AccesssheetSettings = () => {
  const { campaignId } = useParams() as { campaignId: string }
  const parsedCampaignId = parseInt(campaignId, 10)

  return (
    <SheetSettings
      parentResourceType={ParentResourceType.Campaign}
      parentResourceId={parsedCampaignId}
      sheetType={SheetType.Accesssheet}
    />
  )
}
