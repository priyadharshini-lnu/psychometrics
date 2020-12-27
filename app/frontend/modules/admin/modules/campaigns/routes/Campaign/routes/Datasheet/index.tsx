import React from 'react'
import DatasheetManagement from 'modules/admin/modules/DatasheetManagement/App'
import { useParams } from 'react-router-dom'
import { get as getParentResource } from 'modules/admin/modules/DatasheetManagement/core/parentResource'
import { RootState } from 'modules/admin/core/rootReducers'
import { connect } from 'react-redux'

const connecter = connect(
  (state: RootState) => ({
    parentResource: getParentResource(state),
  }),
  {
  },
)

const Datasheet = () => {
  const { campaignId } = useParams<{ campaignId?: string }>()
  if (campaignId) {
    const parsedCampaignId = parseInt(campaignId, 10)

    return <DatasheetManagement parentResource={{ id: parsedCampaignId, type: 'new_campaign' }} />
  }

  return null
}

export default connecter(Datasheet)
