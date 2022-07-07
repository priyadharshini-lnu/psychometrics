import React from 'react'
import { connect } from 'react-redux'
import { DatasheetTabs } from 'modules/admin/modules/DatasheetManagement'

import { ParentResourceType } from 'modules/admin/modules/DatasheetManagement/interfaces'
import { RootState } from 'modules/admin/core/rootReducers'

const Datasheet = ({ campaignId }) => (
  <DatasheetTabs parentResourceType={ParentResourceType.Campaign} parentResourceId={campaignId} />
)

export default connect(({ threeSixtyCampaign: { campaignDetails: { campaignId } } }: RootState) => ({
  campaignId,
}), {})(Datasheet)
