import withSkeleton from 'modules/admin/hoc/withSkeleton'
import { FETCH } from 'modules/admin/modules/threeSixtyCampaign/core/mailHistories'
import MailHistory from './MailHistory'
import connect from './connect'

export default withSkeleton(connect(MailHistory), FETCH)
