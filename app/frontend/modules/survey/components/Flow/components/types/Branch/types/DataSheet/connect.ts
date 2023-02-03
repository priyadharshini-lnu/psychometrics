import { connect } from 'react-redux'
import _ from 'lodash'
import { RootState } from '~/modules/survey/core/rootReducers'

export default connect(
  (state: RootState) => ({
    dataSheetColumns: _.get(state, ['survey', 'builder', 'assessment', 'data_sheet_columns']),
  }),
  {},
)
