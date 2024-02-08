import withSkeleton from '~/modules/admin/hoc/withSkeleton'
import { FETCH_SINGLE } from '~/modules/admin/modules/campaigns/core/users'
import AssessmentsReports from './AssessmentsReports'
import { connecter } from './connect'

export default withSkeleton(connecter(AssessmentsReports), FETCH_SINGLE)
