import withSkeleton from 'modules/admin/core/hoc/withSkeleton'
import RecipientCriteriaList from './RecipientCriteriaList'
import connect from './connect'

export default withSkeleton(connect(RecipientCriteriaList))
