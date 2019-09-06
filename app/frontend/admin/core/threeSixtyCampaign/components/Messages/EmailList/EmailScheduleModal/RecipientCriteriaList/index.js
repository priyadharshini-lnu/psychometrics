import withSkeleton from 'admin/core/hoc/withSkeleton'
import RecipientCriteriaList from './RecipientCriteriaList'
import connect from './connect'

export default withSkeleton(connect(RecipientCriteriaList))
