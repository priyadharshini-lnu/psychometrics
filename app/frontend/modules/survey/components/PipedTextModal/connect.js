import { connect } from 'react-redux'
import { closeModal, getData } from '~/modules/admin/core/ui/modals'

export default connect(
  ({ survey }) => ({
    ...getData(survey).pipedText,
    dataSheetColumns: survey.builder.assessment.data_sheet_columns,
    questions: survey.builder.questions,
  }),
  {
    close: () => closeModal('pipedText'),
  },
)
