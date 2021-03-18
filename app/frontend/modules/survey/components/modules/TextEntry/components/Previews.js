import SingleLine from './types/SingleLinePreview'
import MultiLine from './types/MultiLinePreview'
import Form from './types/Form/Preview'
import DateEntry from './types/DateEntryPreview'
import DateTimeEntry from './types/DateTimeEntryPreview'
import TimeEntry from './types/TimeEntryPreview'
import Chat from './types/Chat/Preview'
import Email from './types/Email/Preview'

export default {
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
