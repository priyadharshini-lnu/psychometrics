import { createRoot } from 'react-dom/client'
import '~/modules/admin/styles/common.less'
import CommunicationForm from '~/modules/admin/modules/CommunicationForm'

window.renderCommunicationForm = (id) => {
  const root = createRoot(document.getElementById(id))
  root.render(<CommunicationForm elementId="body_value" />)
}
