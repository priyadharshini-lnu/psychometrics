import { Component } from 'react'
import '~/modules/survey/styles/globals.less'
import { Provider } from 'react-redux'
import QuestionCenter from '~/modules/survey/layouts/QuestionCenter'
import UndoRedoDispatcher from '~/modules/survey/dispatchers/UndoRedoDispatcher'
import { setStore } from '~/modules/survey/store/StoreWatchman'
import store from '../store'
import { DisplayExceptionModal } from '~/components/DisplayExceptionModal'
import { SessionTimeoutModal } from '~/components/SessionTimeoutModal'
import { DefaultAntThemeWrapper } from '~/glint'
import ErrorModal from '~/components/ErrorModal'

class AppContainer extends Component {
  componentDidMount () {
    setStore(store)
    this.undoListener = UndoRedoDispatcher.addListener('undo', this.update)
    this.redoListener = UndoRedoDispatcher.addListener('redo', this.update)
  }

  componentWillUnmount () {
    this.undoListener.remove()
    this.redoListener.remove()
  }

  undoListener = null

  redoListener = null

  update = () => {
    this.forceUpdate()
  }

  render () {
    return (
      <DefaultAntThemeWrapper>
        <Provider store={store}>
          <QuestionCenter />
          <DisplayExceptionModal />
          <SessionTimeoutModal />
          <ErrorModal />
        </Provider>
      </DefaultAntThemeWrapper>
    )
  }
}

export default AppContainer
