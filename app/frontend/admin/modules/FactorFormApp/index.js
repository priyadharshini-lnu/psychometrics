import React from 'react'
import store from 'admin/store'
import { Provider } from 'react-redux'
import Form from './Form'

export default function FactorFormApp ({
  scoringStrategies, factor, errors, factors,
}) {
  return (
    <div className="ms" style={{ background: 'white' }}>
      <Provider store={store}>
        <Form scoringStrategies={scoringStrategies} factor={factor} errors={errors} factors={factors} />
      </Provider>
    </div>
  )
}
