/* eslint-disable react/no-find-dom-node */
import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import Dashboard from 'modules/reports/views/layouts/Dashboard'
import I18nStore from 'modules/reports/store/I18nStore'
import UndoRedoDispatcher from 'modules/reports/dispatchers/UndoRedoDispatcher'
import HTML5Backend from 'react-dnd-html5-backend'
import { DndProvider } from 'react-dnd'
import ResultStore from 'modules/reports/store/ResultStore'
import Result from 'modules/reports/models/Result'
import 'modules/reports/styles/globals.less'
import store from '../store'

class AppContainer extends Component {
  componentDidMount () {
    const parent = ReactDOM.findDOMNode(this).parentNode
    const assessmentIds = JSON.parse(parent.dataset.assessmentIds)
    _.each(assessmentIds, (id) => {
      ResultStore.results[id] = new Result(id)
    })
    I18nStore.setLocale(document.body.dataset.locale)
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
        <div className="row">
          <DndProvider backend={HTML5Backend}>
            <Dashboard />
          </DndProvider>
        </div>
      </Provider>
    )
  }
}

export default AppContainer
