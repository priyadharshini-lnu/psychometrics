import withSkeleton from 'modules/admin/core/hoc/withSkeleton'
import { compose } from 'redux'
import CampaignList from './CampaignList'
import connect from './connect'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default compose<any>(
  withSkeleton,
  connect,
)(CampaignList)
