import React, { Component } from 'react'
import { Provider } from 'react-redux'
import 'styles/ant.less'
import 'styles/core.scss'
import { BrowserRouter as Router } from 'react-router-dom'
import RouteList from 'components/RouteList'
import UndoRedoDispatcher from 'dispatchers/UndoRedoDispatcher'
import PropertyPanelStore from 'store/PropertyPanelStore'
import AppStore from 'store/AppStore'
import I18nStore from 'store/I18nStore'
import store from '../store'
import routes from './routes'

class AppContainer extends Component {
  undoListener = null

  redoListener = null

  storeListener = null

  componentDidMount () {
    this.undoListener = UndoRedoDispatcher.addListener('undo', this.update)
    this.redoListener = UndoRedoDispatcher.addListener('redo', this.update)
    this.storeListener = AppStore.addListener('change', () => this.forceUpdate())
    I18nStore.setLocale(document.body.dataset.locale)
  }

  componentWillUnmount () {
    this.undoListener.remove()
    this.redoListener.remove()
    this.storeListener.remove()
  }

  update = () => {
    this.forceUpdate()
    PropertyPanelStore.update()
  }

  render () {
    return (
      <div className="row">
        <Provider store={store}>
          <Router>
            <RouteList routes={routes} urlPrefix="/administration" />
          </Router>
        </Provider>
      </div>
    )
  }
}

export default AppContainer
