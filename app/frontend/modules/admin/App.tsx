import React from 'react'
import { BrowserRouter as Router } from 'react-router-dom'
import { Provider } from 'react-redux'
import HTML5Backend from 'react-dnd-html5-backend'
import { DndProvider } from 'react-dnd'
import { ApiClient, ApiProvider } from '@thetalententerprise/jsonapi-react'
import humps from 'humps'
import { Flex } from 'antd'
import { Layout as AdminLayout } from '~/modules/admin/Layout'
import store from '~/modules/admin/store'
import IncorrectResponseErrorModal from '~/components/IncorrectResponseErrorModal'
import { Schema } from '~/libs/jsonApi/schema'
import { MainMenu } from '~/components/MainMenu'
import { DisplayExceptionModal } from '~/components/DisplayExceptionModal'
import { DefaultAntThemeWrapper } from '~/glint'
import styles from './styles.less'

const client = new ApiClient({
  url: `${window.location.origin}/api/v2/administration`,
  schema: humps.decamelizeKeys(Schema),
})

const App: React.FC<void> = () => (
  <DefaultAntThemeWrapper>
    <div style={{ background: 'white' }}>
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <Provider store={store as any}>
        <ApiProvider client={client}>
          <DndProvider backend={HTML5Backend}>
            <Router>
              <Flex className={styles.ctr}>
                <Flex vertical className={styles.aside}>
                  <MainMenu />
                </Flex>
                <Flex vertical className={styles.main}>
                  <AdminLayout />
                </Flex>
              </Flex>
              <IncorrectResponseErrorModal />
              <DisplayExceptionModal />
            </Router>
          </DndProvider>
        </ApiProvider>
      </Provider>
    </div>
  </DefaultAntThemeWrapper>
)

export default App
