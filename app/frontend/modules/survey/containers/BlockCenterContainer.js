import React, { Component } from 'react'
import 'modules/survey/styles/globals.less'
import BlockCenter from 'layouts/BlockCenter'
import UndoRedoDispatcher from 'dispatchers/UndoRedoDispatcher'

import { Provider } from 'react-redux'
import { setStore } from 'store/StoreWatchman'
import store from '../store'

class BlockCenterContainer extends Component {
  undoListener = null

  redoListener = null

  componentDidMount () {
    setStore(store)
    this.undoListener = UndoRedoDispatcher.addListener('undo', this.update)
    this.redoListener = UndoRedoDispatcher.addListener('redo', this.update)
  }

  componentWillUnmount () {
    this.undoListener.remove()
    this.redoListener.remove()
  }

  update = () => {
    this.forceUpdate()
  }

  render () {
    return (
      <Provider store={store}>
        <BlockCenter />
      </Provider>
    )
  }
}

export default BlockCenterContainer
