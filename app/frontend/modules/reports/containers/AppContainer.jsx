/* eslint-disable react/no-find-dom-node */
import { Component } from 'react'
import { findDOMNode } from 'react-dom'
import _ from 'lodash'
import { Provider } from 'react-redux'
import HTML5Backend from 'react-dnd-html5-backend'
import { DndProvider } from 'react-dnd'
import { ErrorBoundary } from 'react-error-boundary'
import Dashboard from '~/modules/reports/views/layouts/Dashboard'
import I18nStore from '~/modules/reports/store/I18nStore'
import UndoRedoDispatcher from '~/modules/reports/dispatchers/UndoRedoDispatcher'
import ResultStore from '~/modules/reports/store/ResultStore'
import Result from '~/modules/reports/models/Result'
import '~/modules/reports/styles/globals.less'
import store from '../store'
import { DefaultAntThemeWrapper } from '~/glint'
import ErrorWarning from '~/modules/reports/views/Preview/ErrorWarning'

class AppContainer extends Component {
  undoListener = null

  redoListener = null

  componentDidMount () {
    const parent = findDOMNode(this).parentNode
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

  update = () => {
    this.forceUpdate()
  }

  render () {
    return (
      <DefaultAntThemeWrapper>
        <ErrorBoundary fallbackRender={() => <ErrorWarning />}>
          <Provider store={store}>
            <div className="row">
              <DndProvider backend={HTML5Backend}>
                <Dashboard />
              </DndProvider>
            </div>
          </Provider>
        </ErrorBoundary>
      </DefaultAntThemeWrapper>
    )
  }
}

export default AppContainer
