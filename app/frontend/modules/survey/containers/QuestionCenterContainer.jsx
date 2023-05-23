import { Component } from 'react'
import '~/modules/survey/styles/globals.less'
import { Provider } from 'react-redux'
import QuestionCenter from '~/modules/survey/layouts/QuestionCenter'
import UndoRedoDispatcher from '~/modules/survey/dispatchers/UndoRedoDispatcher'
import { setStore } from '~/modules/survey/store/StoreWatchman'
import store from '../store'

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
      <Provider store={store}>
        <QuestionCenter />
      </Provider>
    )
  }
}

export default AppContainer
