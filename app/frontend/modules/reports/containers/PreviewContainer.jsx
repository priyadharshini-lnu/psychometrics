/* eslint-disable react/no-find-dom-node */
import { Component } from 'react'
import _ from 'lodash'
import { Provider } from 'react-redux'
import { findDOMNode } from 'react-dom'
import { normalize } from 'normalizr'
import humps from 'humps'
import Preview from '~/modules/reports/views/Preview'
import I18nStore from '~/modules/reports/store/I18nStore'
import store from '~/modules/reports/store/PreviewStore'
import '~/modules/reports/styles/globals.less'
import rstore from '../store'
import { init } from '../core/builder/actions'
import schema from '../store/schema'

class PreviewContainer extends Component {
  state = {
    localeDirection: null,
  }

  componentDidMount () {
    const parent = findDOMNode(this).parentNode
    const {
      data, results, locales, pdfExport, skipLogic, campaignFactorResults,
    } = parent.dataset
    if (locales) {
      I18nStore.locales = JSON.parse(locales)
    }
    const { user, campaign } = parent.dataset
    const parsedData = JSON.parse(data)
    const userReportData = humps.camelizeKeys(JSON.parse(parent.dataset.userReportData))
    parsedData.pdfExport = pdfExport === 'true'
    if (_.isEmpty(I18nStore.locales) && parsedData.locales) {
      I18nStore.locales = parsedData.locales
    }
    const { default_language } = parsedData

    if (default_language) {
      I18nStore.setLocale(default_language.code || document.body.dataset.locale)
      this.setState({ localeDirection: default_language.direction })
    }

    parsedData.moduleOverrides = humps.camelizeKeys(parsedData.module_overrides)
    if (skipLogic === 'true') {
      parsedData.skipLogic = true
    }

    const normalizedData = normalize(parsedData, schema)
    store.init(
      parsedData,
      results ? JSON.parse(results) : null,
      user,
      campaign,
      userReportData, JSON.parse(campaignFactorResults),
    )
    rstore.dispatch(init(normalizedData, userReportData))
  }

  render () {
    const { localeDirection } = this.state

    return (
      <Provider store={rstore}>
        <div className="row">
          <Preview localeDirection={localeDirection} />
        </div>
      </Provider>
    )
  }
}

export default PreviewContainer
