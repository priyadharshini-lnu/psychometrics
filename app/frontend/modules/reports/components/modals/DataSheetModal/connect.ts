import { connect } from 'react-redux'
import { closeModal, getData } from '~/modules/admin/core/ui/modals'
import { saveDataSheet, uploadDataSheet } from '~/modules/reports/core/builder/actions'
import { RootState } from '~/modules/reports/core/rootReducers'

export default connect(
  (state: RootState) => ({
    ...getData(state.report).dataSheetModal,
    threesixty: state.report.builder.category === 'threesixty',
  }),
  {
    close: () => closeModal('dataSheetModal'),
    saveDataSheet,
    uploadDataSheet,
  },
)
