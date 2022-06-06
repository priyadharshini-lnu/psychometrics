import withSkeleton from 'modules/admin/hoc/withSkeleton'
import { FETCH } from 'modules/admin/modules/threeSixtyCampaign/core/messageOptions'
import Options from './Options'
import connect from './connect'

export default withSkeleton(connect(Options), FETCH)
