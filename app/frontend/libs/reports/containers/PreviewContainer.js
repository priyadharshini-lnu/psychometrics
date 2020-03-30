/* eslint-disable react/no-find-dom-node */
import React, { Component } from 'react'
import { Provider } from 'react-redux'
import ReactDOM from 'react-dom'
import Preview from 'rb/views/Preview'
import I18nStore from 'rb/store/I18nStore'
import store from 'rb/store/PreviewStore'
import 'rb/styles/core.scss'
import rstore from '../store'

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

    store.init(JSON.parse(data), results ? JSON.parse(results) : null, user, campaign)
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
