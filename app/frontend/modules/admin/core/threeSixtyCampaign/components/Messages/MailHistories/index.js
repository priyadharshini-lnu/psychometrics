import withSkeleton from 'modules/admin/core/hoc/withSkeleton'
import MailHistory from './MailHistory'
import connect from './connect'

export default withSkeleton(connect(MailHistory))
