import { Component } from 'react'
import { Provider } from 'react-redux'
import { ErrorBoundary } from 'react-error-boundary'
import '~/modules/survey/styles/globals.less'
import { BrowserRouter as Router } from 'react-router-dom'
import UndoRedoDispatcher from '~/modules/survey/dispatchers/UndoRedoDispatcher'
import { setStore } from '~/modules/survey/store/StoreWatchman'
import RouteList from '~/components/RouteList'
import DnDProvider from '~/components/DnD/DnDProvider'
import store from '../store'
import routes from './routes'
import styles from '~/modules/survey/layouts/Dashboard/Dashboard.less'
import { DefaultAntThemeWrapper } from '~/glint'

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

  overlay () {
    return (
      <div onKeyDown={this.disableKey} onClick={this.disableClick} className={styles.overlay}>
        <div className="message-box message-box-danger animated fadeIn open" id="message-box-danger">
          <div className="mb-container">
            <div className="mb-middle">
              <div className="mb-title">
                <span className="fa fa-times" />
                {I18n.t('administration.attention')}
              </div>
              <div className="mb-content">
                <p>{I18n.t('administration.errror_msg')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }


  render () {
    return (
      <DefaultAntThemeWrapper>
        <div className="row">
          <ErrorBoundary fallbackRender={() => this.overlay()}>
            <Provider store={store}>
              <DnDProvider>
                <Router>
                  <RouteList routes={routes} urlPrefix="/administration" />
                </Router>
              </DnDProvider>
            </Provider>
          </ErrorBoundary>
        </div>
      </DefaultAntThemeWrapper>
    )
  }
}

export default AppContainer
