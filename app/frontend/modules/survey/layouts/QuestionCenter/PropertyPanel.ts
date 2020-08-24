import { connect } from 'react-redux'
import PropertyPanel from 'modules/survey/views/PropertyPanel/components/PropertyPanel'
import { changeType, addSkipLogic, addNote } from 'modules/survey/core/builder/assessment/question/actions'
import { openModal } from 'modules/admin/core/ui/modals'
import { RootState } from 'modules/survey/core/rootReducers'

export default connect(
  ({ survey }: RootState) => ({
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
