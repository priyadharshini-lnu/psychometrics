import { connect } from 'react-redux'
import {
  fetch,
  update,
  save,
  get as getInstructionTemplates,
  changeSelected,
} from 'admin/core/threeSixtyCampaign/instructionTemplates'

export default connect(
  state => ({ instructionTemplates: getInstructionTemplates(state) }),
  {
    fetch,
    update,
    save,
    changeSelected,
  },
)
