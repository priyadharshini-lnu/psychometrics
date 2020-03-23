import React from 'react'
import { Provider } from 'react-redux'
import store from 'admin/store'
import GameConfigBuilder from './GameConfigBuilder'

export default function (props) {
  return (
    <Provider store={store}>
      <GameConfigBuilder {...props} />
    </Provider>
  )
}
