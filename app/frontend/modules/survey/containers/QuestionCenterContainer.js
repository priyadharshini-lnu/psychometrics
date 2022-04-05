import React, { Component } from 'react'
import 'styles/core.scss'
import QuestionCenter from 'layouts/QuestionCenter'
import UndoRedoDispatcher from 'dispatchers/UndoRedoDispatcher'
import { setStore } from 'store/StoreWatchman'
import { Provider } from 'react-redux'
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

  undoListener= null

  redoListener= null

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
