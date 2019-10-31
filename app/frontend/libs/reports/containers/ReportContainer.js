/* eslint-disable react/no-find-dom-node */
import React, { Component } from 'react'
import Preview from 'rb/views/Preview'
import I18nStore from 'rb/store/I18nStore'
import store from 'rb/store/PreviewStore'
import 'rb/styles/core.scss'

class ReportContainer extends Component {
  componentDidMount () {
    const {
      data, results, locales, user, campaign,
    } = this.props
    if (locales) {
      I18nStore.setLocale(document.body.dataset.locale)
      I18nStore.locales = locales
    }

    store.init(data, results, user, campaign)
  }

  render () {
    return (
      <div className="row">
        <Preview />
      </div>
    )
  }
}

export default ReportContainer
