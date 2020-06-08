import React, { Component } from 'react'
import { Provider } from 'react-redux'
import 'styles/ant.less'
import 'styles/core.scss'
import { BrowserRouter as Router } from 'react-router-dom'
import RouteList from 'components/RouteList'
import UndoRedoDispatcher from 'dispatchers/UndoRedoDispatcher'
import Watchman from 'store/StoreWatchman'
import DnDProvider from 'components/DnD/DnDProvider'
import store from '../store'
import routes from './routes'

class AppContainer extends Component {
  undoListener = null

  redoListener = null

  storeListener = null

  componentDidMount () {
    Watchman.set(store)
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
