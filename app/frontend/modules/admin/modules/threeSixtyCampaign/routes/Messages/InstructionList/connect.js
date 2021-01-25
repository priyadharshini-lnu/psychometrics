import { connect } from 'react-redux'
import {
  fetch,
  update,
  fetchByLocales,
  save,
  get as getInstructionTemplates,
} from 'modules/admin/modules/threeSixtyCampaign/core/instructionTemplates'

export default connect(
  state => ({ instructionTemplates: getInstructionTemplates(state), availableLocales: state.config.availableLocales }),
  {
    fetch,
    fetchByLocales,
    update,
    save,
  },
)
