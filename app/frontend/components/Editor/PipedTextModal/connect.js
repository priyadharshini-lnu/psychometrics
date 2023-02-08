import { connect } from 'react-redux'
import { closeModal, getCurrent, getData } from '~/modules/admin/core/ui/modals'
import { get as getDatasheetField } from '~/modules/admin/modules/threeSixtyCampaign/core/datasheetFields'

export default connect(
  state => ({
    current: getCurrent(state),
    data: getData(state).PipedTextModal,
    datasheetFields: getDatasheetField(state),
  }),
  {
    closeModal,
  },
)
