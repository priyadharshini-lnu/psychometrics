import React, { Component } from 'react'
import { Provider } from 'react-redux'
import '~/modules/survey/styles/globals.less'
import { BrowserRouter as Router } from 'react-router-dom'
import UndoRedoDispatcher from '~/modules/survey/dispatchers/UndoRedoDispatcher'
import { setStore } from '~/modules/survey/store/StoreWatchman'
import RouteList from '~/components/RouteList'
import DnDProvider from '~/components/DnD/DnDProvider'
import store from '../store'
import routes from './routes'

class AppContainer extends Component {
  undoListener = null

  redoListener = null

  storeListener = null

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
      <div className="row">
        <Provider store={store}>
          <DnDProvider>
            <Router>
              <RouteList routes={routes} urlPrefix="/administration" />
            </Router>
          </DnDProvider>
        </Provider>
      </div>
    )
  }
}

export default AppContainer
