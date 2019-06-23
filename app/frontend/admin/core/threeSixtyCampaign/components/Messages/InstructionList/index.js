import withSkeleton from 'admin/core/hoc/withSkeleton'
import InstructionList from './InstructionList'
import connect from './connect'

export default withSkeleton(connect(InstructionList))
