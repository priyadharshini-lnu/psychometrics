import { RootState } from 'modules/survey/core/rootReducers'
import { connect } from 'react-redux'

export default connect(
  (state: RootState) => ({
    dataSheetColumns: state.survey.builder.assessment.data_sheet_columns,
  }),
  {},
)
