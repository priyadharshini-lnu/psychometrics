/* eslint-disable react/no-find-dom-node */
import React, { Component } from 'react'
import { Provider } from 'react-redux'
import ReactDOM from 'react-dom'
import Preview from 'modules/reports/views/Preview'
import I18nStore from 'modules/reports/store/I18nStore'
import store from 'modules/reports/store/PreviewStore'
import 'modules/reports/styles/core.less'
import { normalize } from 'normalizr'
import rstore from '../store'
import { init } from '../core/builder/actions'
import schema from '../store/schema'

class PreviewContainer extends Component {
  componentDidMount () {
    const parent = ReactDOM.findDOMNode(this).parentNode
    const {
      data, results, locales, selectedLocale,
    } = parent.dataset

    if (locales) {
      I18nStore.setLocale(selectedLocale || document.body.dataset.locale)
      I18nStore.locales = JSON.parse(locales)
    }
    const { user, campaign } = parent.dataset
    const parsedData = JSON.parse(data)
    if (_.isEmpty(I18nStore.locales) && parsedData.locales) {
      I18nStore.locales = parsedData.locales
    }
    const normalizedData = normalize(parsedData, schema)
    store.init(parsedData, results ? JSON.parse(results) : null, user, campaign)
    rstore.dispatch(init(normalizedData))
  }

  render () {
    return (
      <Provider store={rstore}>
        <div className="row">
          <Preview />
        </div>
      </Provider>
    )
  }
}

export default PreviewContainer
