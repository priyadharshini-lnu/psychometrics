import { connect } from 'react-redux'
import { closeModal } from 'admin/core/temp/modals'
import { IMPORT, importFile } from 'admin/core/threeSixtyCampaign/evaluators/'

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
