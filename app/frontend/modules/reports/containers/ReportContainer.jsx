/* eslint-disable react/no-find-dom-node */
import React, { Component } from 'react'
import { Provider } from 'react-redux'
import _ from 'lodash'
import { normalize } from 'normalizr'
import Preview from '~/modules/reports/views/Preview'
import I18nStore from '~/modules/reports/store/I18nStore'
import store from '~/modules/reports/store/PreviewStore'
import '~/modules/reports/styles/globals.less'
import globalStore from '~/modules/admin/store'
import rstore from '../store'
import { init, changeSkipLogic } from '../core/builder/actions'
import schema from '../store/schema'

class ReportContainer extends Component {
  state = {
    selectedLocale: null,
  }

  componentDidMount () {
    const {
      data, results, locales, user, campaign, selectedLocale, userReport, skipLogic,
    } = this.props
    if (locales) {
      I18nStore.setLocale(_.get(selectedLocale, 'code', document.body.dataset.locale))
      I18nStore.locales = locales
    }
    data.skipLogic = skipLogic
    const normalizedData = normalize(data, schema)
    store.init(data, results, user, campaign, userReport.reportData || [])
    rstore.dispatch(init(normalizedData, userReport))
    this.setState({ selectedLocale })
  }

  componentDidUpdate (prevProps) {
    const { skipLogic } = this.props
    if (prevProps.skipLogic !== skipLogic) {
      rstore.dispatch(changeSkipLogic(skipLogic))
    }
  }

  render () {
    const {
      showOverrides = false, userReport: { moduleOverrides }, dashboard, allowEdit, allowApprove,
    } = this.props
    return (
      <Provider store={rstore}>
        <div className="row">
          <Preview
            rstore={globalStore}
            localeDirection={_.get(this.state, 'selectedLocale.direction', 'ltr')}
            allowEdit={allowEdit}
            allowApprove={allowApprove}
            showOverrides={showOverrides}
            moduleOverrides={moduleOverrides}
            dashboard={dashboard}
          />
        </div>
      </Provider>
    )
  }
}

export default ReportContainer
