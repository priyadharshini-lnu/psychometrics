import React, { useEffect } from 'react'
import store from 'modules/admin/store'
import { Provider } from 'react-redux'
import IncorrectResponseErrorModal from 'components/IncorrectResponseErrorModal'
import isEmpty from 'lodash/isEmpty'
import DatasheetListing from './routes/DatasheetListing'
import {
  State as ParentResource,
  set as setParentResource,
  get as getParenResource,
} from './core/parentResource'

interface Props {
  parentResource?: ParentResource
}

const App: React.FC<Props> = ({ parentResource }) => {
  useEffect(() => {
    if (parentResource) {
      store.dispatch(setParentResource(parentResource))
    }
  }, [])

  return (
    <div className="ms" style={{ background: 'white' }}>
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <Provider store={store as any}>
        {!isEmpty(getParenResource(store.getState())) && <DatasheetListing />}
        <IncorrectResponseErrorModal />
      </Provider>
    </div>
  )
}

export default App
