import { useEffect, useReducer } from 'react'
import { Outlet } from 'react-router-dom'
import { Provider } from 'react-redux'
import { ErrorBoundary } from 'react-error-boundary'
import { DefaultAntThemeWrapper } from '~/glint'
import DnDProvider from '~/components/DnD/DnDProvider'
import IncorrectResponseErrorModal from '~/components/IncorrectResponseErrorModal'
import { useMinimizeSider } from '~/components/AdminShell/useMinimizeSider'
import UndoRedoDispatcher from '~/modules/survey/dispatchers/UndoRedoDispatcher'
import { setStore } from '~/modules/survey/store/StoreWatchman'
import store from '../store'
import styles from '~/modules/survey/layouts/Dashboard/Dashboard.less'
import '~/modules/survey/styles/globals.less'

const Overlay = () => (
  <div className={styles.overlay}>
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

// Shared shell for the builder's routed pages (Dashboard/Scoring/ResourceManager): the redux store,
// drag/drop context, and undo/redo wiring that used to live on the builder's own standalone AppContainer,
// now mounted as a parent route inside the admin SPA's router instead of owning its own createBrowserRouter.
const BuilderLayout = () => {
  const [, forceUpdate] = useReducer(x => x + 1, 0)
  useMinimizeSider()

  useEffect(() => {
    setStore(store)
    const undoListener = UndoRedoDispatcher.addListener('undo', forceUpdate)
    const redoListener = UndoRedoDispatcher.addListener('redo', forceUpdate)
    return () => {
      undoListener.remove()
      redoListener.remove()
    }
  }, [])

  return (
    <DefaultAntThemeWrapper>
      <ErrorBoundary fallbackRender={() => <Overlay />}>
        <Provider store={store}>
          <DnDProvider>
            <Outlet />
            <IncorrectResponseErrorModal />
          </DnDProvider>
        </Provider>
      </ErrorBoundary>
    </DefaultAntThemeWrapper>
  )
}

export default BuilderLayout
