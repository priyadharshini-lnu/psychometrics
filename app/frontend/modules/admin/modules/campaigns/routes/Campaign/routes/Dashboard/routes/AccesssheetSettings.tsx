import { SheetType } from 'modules/admin/modules/SheetManagement/core/list'
import { SheetSettings } from 'modules/admin/modules/SheetManagement/SheetSettings'
import { ParentResourceType } from 'modules/admin/modules/SheetManagement/interfaces'
import React from 'react'
import { useParams } from 'react-router-dom'

export const AccesssheetSettings = () => {
  const { campaignId } = useParams<{ campaignId: string }>()
  const parsedCampaignId = parseInt(campaignId, 10)

  return (
    <SheetSettings
      parentResourceType={ParentResourceType.Campaign}
      parentResourceId={parsedCampaignId}
      sheetType={SheetType.Accesssheet}
    />
  )
}
