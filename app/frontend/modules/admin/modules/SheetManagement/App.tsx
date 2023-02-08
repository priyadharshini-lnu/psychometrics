import React from 'react'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'

import store from '~/modules/admin/store'
import IncorrectResponseErrorModal from '~/components/IncorrectResponseErrorModal'
import { SheetTabs } from './SheetTabs'
import { ParentResourceType } from './interfaces/index'


// We need this app as projects sheet is not under new campaign app
const App: React.FC = () => (
  <div className="mt-4 mb-4 ms-4 me-4" style={{ background: 'white' }}>
    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
    <Provider store={store as any}>
      <BrowserRouter>
        <SheetTabs parentResourceType={ParentResourceType.Project} />
      </BrowserRouter>
      <IncorrectResponseErrorModal />
    </Provider>
  </div>
)

export default App
