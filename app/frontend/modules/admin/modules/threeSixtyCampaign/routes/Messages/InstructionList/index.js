import withSkeleton from 'modules/admin/hoc/withSkeleton'
import { FETCH } from 'modules/admin/modules/threeSixtyCampaign/core/instructionTemplates'
import InstructionList from './InstructionList'
import connect from './connect'

export default withSkeleton(connect(InstructionList), FETCH)
