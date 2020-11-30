import { connect } from 'react-redux'

export default connect(
  state => ({
    dataSheetColumns: state.survey.builder.assessment.data_sheet_columns,
  }),
  {},
)
