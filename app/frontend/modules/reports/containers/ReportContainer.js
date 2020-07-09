/* eslint-disable react/no-find-dom-node */
import React, { Component } from 'react'
import { Provider } from 'react-redux'
import _ from 'lodash'
import Preview from 'rb/views/Preview'
import I18nStore from 'rb/store/I18nStore'
import store from 'rb/store/PreviewStore'
import 'rb/styles/core.scss'
import { normalize } from 'normalizr'
import rstore from '../store'
import { init } from '../core/builder/actions'
import schema from '../store/schema'

class ReportContainer extends Component {
  state = {
    selectedLocale: null,
  }

  componentDidMount () {
    const {
      data, results, locales, user, campaign, selectedLocale,
    } = this.props
    if (locales) {
      I18nStore.setLocale(_.get(selectedLocale, 'code', document.body.dataset.locale))
      I18nStore.locales = locales
    }

    const normalizedData = normalize(data, schema)
    store.init(data, results, user, campaign)
    rstore.dispatch(init(normalizedData))
    this.setState({ selectedLocale })
  }

  render () {
    return (
      <Provider store={rstore}>
        <div className="row">
          <Preview localeDirection={_.get(this.state, 'selectedLocale.direction', 'ltr')} />
        </div>
      </Provider>
    )
  }
}

export default ReportContainer
