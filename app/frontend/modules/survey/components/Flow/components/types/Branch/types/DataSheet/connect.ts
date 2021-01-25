import { RootState } from 'modules/survey/core/rootReducers'
import { connect } from 'react-redux'
import _ from 'lodash'

export default connect(
  (state: RootState) => ({
    dataSheetColumns: _.get(state, ['survey', 'builder', 'assessment', 'data_sheet_columns']),
  }),
  {},
)
