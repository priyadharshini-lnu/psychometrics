import manageModal from '~/components/hocs/manageModal'
import NominationRequirementModal from './NominationRequirementModal'
import connect from './connect'

NominationRequirementModal.className = 'NominationRequirement'

export default connect(manageModal(NominationRequirementModal))
