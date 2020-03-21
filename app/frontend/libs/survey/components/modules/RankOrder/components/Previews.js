import SelectBoxPreview from './types/SelectBox/Preview'
import DragAndDropPreview from './types/DragAndDrop/Preview'
import RadioButtonsPreview from './types/RadioButtons/Preview'
import TextBoxPreview from './types/TextBox/Preview'
import connect from '../connect'

export default {
  SelectBox: connect(SelectBoxPreview),
  DragAndDrop: connect(DragAndDropPreview),
  RadioButtons: connect(RadioButtonsPreview),
  TextBox: connect(TextBoxPreview),
}
