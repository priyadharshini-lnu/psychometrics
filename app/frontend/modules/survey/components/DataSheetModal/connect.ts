import { connect } from 'react-redux'
import { closeModal, getData } from 'modules/admin/core/ui/modals'
import { saveDataSheet, uploadDataSheet } from 'modules/survey/core/builder/assessment/actions'
import { RootState } from 'modules/survey/core/rootReducers'

export default connect(
  (state: RootState) => ({
    ...getData(state.survey).dataSheetModal,
  }),
  {
    close: () => closeModal('dataSheetModal'),
    saveDataSheet,
    uploadDataSheet,
  },
)
