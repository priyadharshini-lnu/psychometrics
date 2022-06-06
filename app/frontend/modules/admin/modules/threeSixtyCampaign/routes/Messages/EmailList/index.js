import withSkeleton from 'modules/admin/hoc/withSkeleton'
import { FETCH } from 'modules/admin/modules/threeSixtyCampaign/core/emailTemplates'
import EmailList from './EmailList'
import connect from './connect'

export default withSkeleton(connect(EmailList), FETCH)
