import SingleLine from './types/SingleLine'
import MultiLine from './types/MultiLine'
import Form from './types/Form'
import DateEntry from './types/DateEntry'
import DateTimeEntry from './types/DateTimeEntry'
import Previews from './Previews'

const Templates = {
  SingleLine,
  MultiLine,
  Form,
  Password: SingleLine,
  EssayTextBox: MultiLine,
  DateEntry,
  DateTimeEntry,
}

export { Templates, Previews }
export default Templates
