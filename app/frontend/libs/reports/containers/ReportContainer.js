/* eslint-disable react/no-find-dom-node */
import React, { Component } from 'react'
import _ from 'lodash'
import Preview from 'rb/views/Preview'
import I18nStore from 'rb/store/I18nStore'
import store from 'rb/store/PreviewStore'
import 'rb/styles/core.scss'


class ReportContainer extends Component {
  componentDidMount () {
    const {
      data, results, locales, user, campaign, selectedLocale,
    } = this.props
    if (locales) {
      I18nStore.setLocale(_.get(selectedLocale, 'code', document.body.dataset.locale))
      I18nStore.locales = locales
    }
    this.direction = _.get(selectedLocale, 'direction', 'ltr')
    store.init(data, results, user, campaign)
  }

  render () {
    return (
      <div className="row">
        <Preview localeDirection={this.direction} />
      </div>
    )
  }
}

export default ReportContainer
