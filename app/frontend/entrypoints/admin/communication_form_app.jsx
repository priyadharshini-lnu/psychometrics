import { createRoot } from 'react-dom/client'
import '~/modules/admin/styles/common.less'
import CommunicationForm from '~/modules/admin/modules/CommunicationForm'
import { SubjectPipedTextButton } from '~/modules/admin/modules/CommunicationForm/SubjectPipedTextButton'
import setLocale from '~/utils/setLocale'

setLocale()

window.renderCommunicationForm = (id) => {
  const root = createRoot(document.getElementById(id))
  root.render(<CommunicationForm elementId="body_value" />)
}

window.renderSubjectPipedTextButton = (id) => {
  const handleSubjectPipedTextInsert = (value) => {
    // Get the current subject value
    const currentSubject = document.forms.new_resource['resource[subject]'].value || ''

    document.forms.new_resource['resource[subject]'].value = currentSubject + value
  }

  const root = createRoot(document.getElementById(id))
  root.render(<SubjectPipedTextButton communicationKind="communication" onInsert={handleSubjectPipedTextInsert} />)
}
