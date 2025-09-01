/* eslint-disable react/no-find-dom-node */
import { Component } from 'react'
import { findDOMNode } from 'react-dom'
import _ from 'lodash'
import { Provider } from 'react-redux'
import HTML5Backend from 'react-dnd-html5-backend'
import { DndProvider } from 'react-dnd'
import { BrowserRouter } from 'react-router-dom'
import { ApiClient, ApiProvider } from '@thetalententerprise/jsonapi-react'
import humps from 'humps'
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
import { Schema } from '~/libs/jsonApi/schema'

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
    const client = new ApiClient({
      url: `${window.location.origin}/api/v2/administration`,
      schema: humps.decamelizeKeys(Schema),
    })

    return (
      <DefaultAntThemeWrapper>
        <ErrorBoundary fallbackRender={() => <ErrorWarning />}>
          <Provider store={store}>
            <ApiProvider client={client}>
              <BrowserRouter>
                <div className="row">
                  <DndProvider backend={HTML5Backend}>
                    <Dashboard />
                  </DndProvider>
                </div>
              </BrowserRouter>
            </ApiProvider>
          </Provider>
        </ErrorBoundary>
      </DefaultAntThemeWrapper>
    )
  }
}

export default AppContainer
