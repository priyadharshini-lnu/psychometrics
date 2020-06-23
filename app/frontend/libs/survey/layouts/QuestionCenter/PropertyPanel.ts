import { connect } from 'react-redux'
import PropertyPanel from 'libs/survey/views/PropertyPanel/components/PropertyPanel'
import { changeType, addSkipLogic, addNote } from 'libs/survey/core/builder/assessment/question/actions'
import { openModal } from 'modules/admin/core/temp/modals'

export default connect(
  ({ survey }) => ({
    loaded: survey.builder.questionCenter.loaded,
    disabled: survey.builder.questionCenter.disabled,
    socketInitialized: survey.temp.socket.initialized,
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
