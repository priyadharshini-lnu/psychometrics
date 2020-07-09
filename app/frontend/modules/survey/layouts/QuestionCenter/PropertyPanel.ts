import { connect } from 'react-redux'
import PropertyPanel from 'modules/survey/views/PropertyPanel/components/PropertyPanel'
import { changeType, addSkipLogic, addNote } from 'modules/survey/core/builder/assessment/question/actions'
import { openModal } from 'modules/admin/core/ui/modals'

export default connect(
  ({ survey }) => ({
    loaded: survey.builder.questionCenter.loaded,
    disabled: survey.builder.questionCenter.disabled,
    socketInitialized: survey.ui.socket.initialized,
    question: survey.builder.questionCenter.question,
    offset: 20,
  }),
  {
    openPreview: data => openModal('preview', data),
    changeType,
    addSkipLogic,
    addNote,
  },
)(PropertyPanel)
