import { connect } from 'react-redux'
import { RootState } from 'modules/reports/core/rootReducers'
import { close, changeColor } from '../../../../core/temp/colorPicker'

export default connect(
  (state: RootState) => ({
    color: state.report.ui.colorPicker.color,
    isOpen: state.report.ui.colorPicker.isOpen,
    onComplete: state.report.ui.colorPicker.onComplete,
    onChange: state.report.ui.colorPicker.onChange,
  }),
  {
    closePicker: close,
    changeColor,
  },
)
