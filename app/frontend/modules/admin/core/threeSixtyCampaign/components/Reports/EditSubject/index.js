import withSkeleton from 'modules/admin/core/hoc/withSkeleton'
import EditSubject from './EditSubject'
import connect from './connect'

export default withSkeleton(connect(EditSubject))
