import SingleLine from './types/SingleLine'
import MultiLine from './types/MultiLine'
import Form from './types/Form/Builder'
import DateEntry from './types/DateEntry'
import DateTimeEntry from './types/DateTimeEntry'
import TimeEntry from './types/TimeEntry'
import Chat from './types/Chat/Builder'
import Email from './types/Email/Builder'
import Previews from './Previews'

const Templates = {
  SingleLine,
  MultiLine,
  Form,
  Password: SingleLine,
  EssayTextBox: MultiLine,
  DateEntry,
  DateTimeEntry,
  TimeEntry,
  Chat,
  Email,
}

export { Templates, Previews }
export default Templates
