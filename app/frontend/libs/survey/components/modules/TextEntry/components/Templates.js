import SingleLine from './types/SingleLine'
import MultiLine from './types/MultiLine'
import Form from './types/Form'
import Previews from './Previews'

const Templates = {
  SingleLine,
  MultiLine,
  Form,
  Password: SingleLine,
  EssayTextBox: MultiLine,
}

export { Templates, Previews }
export default Templates
