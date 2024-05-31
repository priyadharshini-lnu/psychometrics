import { connect } from 'react-redux'
import { closeModal, getCurrent } from '~/modules/admin/core/ui/modals'
import { IMPORT, importFile } from '~/modules/admin/modules/threeSixtyCampaign/core/evaluators/'
import { isRequestInProgress } from '~/core/request'

export default connect(
  state => ({
    current: getCurrent(state),
    importInProgress: isRequestInProgress(state, IMPORT),
  }),
  {
    closeModal,
    importFile,
  },
)
