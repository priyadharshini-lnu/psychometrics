import { connect } from 'react-redux'

export default connect(
  state => ({
    dataSheetColumns: state.survey.builder.assessment.dataSheetColumns,
  }),
  {},
)
