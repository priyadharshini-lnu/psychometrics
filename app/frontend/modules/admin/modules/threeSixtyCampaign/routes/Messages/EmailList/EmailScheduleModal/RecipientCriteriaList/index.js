import withSkeleton from 'modules/admin/hoc/withSkeleton'
import RecipientCriteriaList from './RecipientCriteriaList'
import connect from './connect'

export default withSkeleton(connect(RecipientCriteriaList))
