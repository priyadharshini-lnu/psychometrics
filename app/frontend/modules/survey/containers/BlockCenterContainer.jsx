import { Component } from 'react'
import '~/modules/survey/styles/globals.less'
import { Provider } from 'react-redux'
import { BrowserRouter as Router } from 'react-router-dom'
import BlockCenter from '~/modules/survey/layouts/BlockCenter'
import UndoRedoDispatcher from '~/modules/survey/dispatchers/UndoRedoDispatcher'
import DnDProvider from '~/components/DnD/DnDProvider'
import { DefaultAntThemeWrapper } from '~/glint'

import { setStore } from '~/modules/survey/store/StoreWatchman'
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
      <Router>
        <DefaultAntThemeWrapper>
          <Provider store={store}>
            <DnDProvider>
              <BlockCenter />
            </DnDProvider>
          </Provider>
        </DefaultAntThemeWrapper>
      </Router>
    )
  }
}

export default BlockCenterContainer
