import UndoRedoDispatcher from 'rb/dispatchers/UndoRedoDispatcher'
import * as BlockActions from './BlockActions'
import * as QuestionActions from './QuestionActions'
import * as GapAnalysis from './GapAnalysis'
import * as CommonActions from './CommonActions'
import * as SideBySide from './SideBySide'

const Actions = {
  ...BlockActions,
  ...QuestionActions,
  ...GapAnalysis,
  ...CommonActions,
  ...SideBySide,
}

const Factory = function (action, subject, object) {
  const Action = Actions[action]
  UndoRedoDispatcher.newAction(Action(subject, object))
}

export default Factory
