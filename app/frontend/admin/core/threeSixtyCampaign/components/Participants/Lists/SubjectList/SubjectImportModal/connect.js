import { connect } from 'react-redux'
import { closeModal } from 'admin/core/temp/modals'
import { IMPORT, importFile } from 'admin/core/threeSixtyCampaign/subjects'

export default connect(
  ({ temp: { modals: { current }, request: { loading, name: requestName} },
    threeSixtyCampaign: { subjects: { import: { errors } } } }) => ({
    current,
    importInProgress: requestName === IMPORT && loading,
    errors
  }),
  {
    closeModal,
    importFile
  },
)
