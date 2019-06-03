import { connect } from 'react-redux'
import { closeModal } from 'admin/core/temp/modals'
import { importFile } from 'admin/core/threeSixtyCampaign/subjects'

export default connect(
  ({ temp: { modals: { current } }, }) => ({
    current
  }),
  {
    closeModal,
    importFile
  },
)
