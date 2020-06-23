import { connect } from 'react-redux'
import { closeModal } from 'modules/admin/core/temp/modals'
import { IMPORT, importFile } from 'modules/admin/modules/threeSixtyCampaign/core/evaluators/'

export default connect(
  ({
    temp: { modals: { current }, request: { loading, name: requestName } },
  }) => ({
    current,
    importInProgress: requestName === IMPORT && loading,
  }),
  {
    closeModal,
    importFile,
  },
)
