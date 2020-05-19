import { connect } from 'react-redux'
import { close, changeColor } from '../../../../core/temp/colorPicker'

export default connect(
  state => ({
    color: state.report.temp.colorPicker.color,
    isOpen: state.report.temp.colorPicker.isOpen,
    onComplete: state.report.temp.colorPicker.onComplete,
    onChange: state.report.temp.colorPicker.onChange,
  }),
  {
    closePicker: close,
    changeColor,
  },
)
