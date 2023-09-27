import SingleLine from './components/types/SingleLinePreview'
import MultiLine from './components/types/MultiLinePreview'
import Form from './components/types/Form/Preview'
import DateEntry from './components/types/DateEntryPreview'
import DateTimeEntry from './components/types/DateTimeEntryPreview'
import TimeEntry from './components/types/TimeEntryPreview'
import Chat from './components/types/Chat/Preview'
import Email from './components/types/Email/Preview'
import RichText from './components/types/RichText/RichTextPreview'

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
  RichText,
}
