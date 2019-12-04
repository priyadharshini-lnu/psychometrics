/* eslint-disable react/no-find-dom-node */
import React, { Component } from 'react'
import _ from 'lodash'
import Preview from 'rb/views/Preview'
import I18nStore from 'rb/store/I18nStore'
import store from 'rb/store/PreviewStore'
import 'rb/styles/core.scss'


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
    store.init(data, results, user, campaign)
    this.setState({ selectedLocale })
  }

  render () {
    return (
      <div className="row">
        <Preview localeDirection={_.get(this.state, 'selectedLocale.direction', 'ltr')} />
      </div>
    )
  }
}

export default ReportContainer
