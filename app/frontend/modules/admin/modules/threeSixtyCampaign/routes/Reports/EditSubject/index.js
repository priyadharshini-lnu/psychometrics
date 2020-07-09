import withSkeleton from 'modules/admin/hoc/withSkeleton'
import EditSubject from './EditSubject'
import connect from './connect'

export default withSkeleton(connect(EditSubject))
