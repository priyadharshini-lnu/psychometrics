import { connect } from 'react-redux'
import {
  fetch,
  update,
  save,
  get as getInstructionTemplates,
} from 'modules/admin/modules/threeSixtyCampaign/core/instructionTemplates'

export default connect(
  state => ({ instructionTemplates: getInstructionTemplates(state) }),
  {
    fetch,
    update,
    save,
  },
)
