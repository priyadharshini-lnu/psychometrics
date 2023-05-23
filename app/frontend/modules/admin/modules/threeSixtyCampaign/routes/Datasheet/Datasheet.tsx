import { connect } from 'react-redux'
import { SheetTabs } from '~/modules/admin/modules/SheetManagement'

import { ParentResourceType } from '~/modules/admin/modules/SheetManagement/interfaces'
import { RootState } from '~/modules/admin/core/rootReducers'

const Datasheet = ({ campaignId }) => (
  <SheetTabs parentResourceType={ParentResourceType.Campaign} parentResourceId={campaignId} />
)

export default connect(({ threeSixtyCampaign: { campaignDetails: { campaignId } } }: RootState) => ({
  campaignId,
}), {})(Datasheet)
