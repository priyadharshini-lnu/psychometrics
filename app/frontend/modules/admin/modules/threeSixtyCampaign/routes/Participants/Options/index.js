import withSkeleton from 'modules/admin/hoc/withSkeleton'
import Options from './Options'
import connect from './connect'

export default withSkeleton(connect(Options))
