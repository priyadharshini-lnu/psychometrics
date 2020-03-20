import SingleLine from './types/SingleLinePreview'
import MultiLine from './types/MultiLinePreview'
import Form from './types/FormPreview'
import DateEntry from './types/DateEntryPreview'
import DateTimeEntry from './types/DateTimeEntryPreview'
import Chat from './types/Chat/Preview'

export default {
  SingleLine,
  MultiLine,
  Form,
  Password: SingleLine,
  EssayTextBox: MultiLine,
  DateEntry,
  DateTimeEntry,
  Chat,
}
