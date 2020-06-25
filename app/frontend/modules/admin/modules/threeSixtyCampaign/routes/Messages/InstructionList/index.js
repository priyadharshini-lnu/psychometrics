import withSkeleton from 'modules/admin/hoc/withSkeleton'
import InstructionList from './InstructionList'
import connect from './connect'

export default withSkeleton(connect(InstructionList))
