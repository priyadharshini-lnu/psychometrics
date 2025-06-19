import { createRoot } from 'react-dom/client'
import '~/modules/admin/styles/common.less'
import CommunicationForm from '~/modules/admin/modules/CommunicationForm'
import { SubjectPipedTextButton } from '~/modules/admin/modules/CommunicationForm/SubjectPipedTextButton'

window.renderTranslationForm = (id) => {
  const root = createRoot(document.getElementById(id))
  root.render(<CommunicationForm elementId="translation_body_value" />)
}

window.renderSubjectPipedTextButton = (id) => {
  const handleSubjectPipedTextInsert = (value) => {
    const currentSubject = document.forms.new_resource['resource[subject]'].value || ''

    document.forms.new_resource['resource[subject]'].value = currentSubject + value
  }

  const root = createRoot(document.getElementById(id))
  root.render(<SubjectPipedTextButton communicationKind="translation" onInsert={handleSubjectPipedTextInsert} />)
}
