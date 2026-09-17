/* eslint-disable react/no-find-dom-node */
import { Component } from 'react'
import { Provider } from 'react-redux'
import { findDOMNode, createPortal } from 'react-dom'
import { normalize } from 'normalizr'
import humps from 'humps'
import Preview from '~/modules/reports/views/Preview'
import I18nStore from '~/modules/reports/store/I18nStore'
import store from '~/modules/reports/store/PreviewStore'
import '~/modules/reports/styles/globals.less'
import { LangDropdown } from '~/components/LangDropdown'
import rstore from '../store'
import { init } from '../core/builder/actions'
import schema from '../store/schema'

class PreviewContainer extends Component {
  state = {
    locales: [],
    currentLocale: null,
    switcherTarget: null,
  }

  handleLanguageChange = (key) => {
    const searchParams = new URLSearchParams(window.location.search)
    searchParams.set('lang', key)
    window.location.search = searchParams.toString()
  }

  componentDidMount () {
    const parent = findDOMNode(this).parentNode
    const {
      data, results, pdfExport, skipLogic, campaignFactorResults, campaignAiArtifactResults,
    } = parent.dataset
    const { user, campaign } = parent.dataset
    const parsedData = JSON.parse(data)
    const userReportData = humps.camelizeKeys(JSON.parse(parent.dataset.userReportData))
    parsedData.pdfExport = pdfExport === 'true'
    if (parsedData.locales) {
      I18nStore.locales = parsedData.locales
    }
    const { default_language, available_languages } = parsedData
    const locales = [...new Set([
      ...(available_languages || []).map(language => language.code),
      default_language?.code,
    ].filter(Boolean))]
    const currentLocale = new URLSearchParams(window.location.search).get('lang') || default_language?.code || null
    const switcherTarget = document.getElementById('report_preview_lang_switcher')

    this.setState({ locales, currentLocale, switcherTarget })

    if (default_language) {
      I18nStore.setLocale(document.body.dataset.locale || default_language.code)
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
      userReportData,
      campaignFactorResults ? JSON.parse(campaignFactorResults) : null,
      campaignAiArtifactResults ? JSON.parse(campaignAiArtifactResults) : null,
    )
    rstore.dispatch(init(normalizedData, userReportData))
  }

  render () {
    const { locales, currentLocale, switcherTarget } = this.state

    return (
      <Provider store={rstore}>
        <div style={{ direction: 'ltr' }}>
          {locales.length > 1 && switcherTarget && createPortal(
            <LangDropdown
              locales={locales}
              currentLocale={currentLocale}
              onChange={this.handleLanguageChange}
            />,
            switcherTarget,
          )}
          <div className="row">
            <Preview />
          </div>
        </div>
      </Provider>
    )
  }
}

export default PreviewContainer
