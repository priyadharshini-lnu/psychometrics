import { connect } from 'react-redux'
import { closeModal } from '~/modules/admin/core/ui/modals'
import { saveDataSheet, uploadDataSheet } from '~/modules/reports/core/builder/actions'
import { RootState } from '~/modules/reports/core/rootReducers'

export default connect(
  ({ report: { builder } }: RootState) => ({
    columns: builder.data_sheet_columns,
    id: builder.id,
    threesixty: builder.category === 'threesixty',
  }),
  {
    close: () => closeModal('dataSheetModal'),
    saveDataSheet,
    uploadDataSheet,
  },
)
