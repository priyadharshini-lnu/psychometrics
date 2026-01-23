/* eslint-disable react/no-find-dom-node */
import { Component } from 'react'
import { Provider } from 'react-redux'
import _ from 'lodash'
import { normalize } from 'normalizr'
import { ErrorBoundary } from 'react-error-boundary'
import PageList from '~/modules/reports/store/PageList'
import LogicResolver from '~/modules/reports/models/logic/LogicResolver'
import Preview from '~/modules/reports/views/Preview'
import I18nStore from '~/modules/reports/store/I18nStore'
import store from '~/modules/reports/store/PreviewStore'
import '~/modules/reports/styles/globals.less'
import globalStore from '~/modules/admin/store'
import ErrorWarning from '~/modules/reports/views/Preview/ErrorWarning'
import rstore from '../store'
import { init, changeSkipLogic } from '../core/builder/actions'
import schema from '../store/schema'

class ReportContainer extends Component {
  state = {
    selectedLocale: null,
  }

  componentDidMount () {
    const {
      data, results, locales, user, campaign, selectedLocale, userReport, skipLogic, setPages,
    } = this.props
    if (locales) {
      I18nStore.setLocale(_.get(selectedLocale, 'code', document.body.dataset.locale))
      I18nStore.locales = locales
    }

    data.skipLogic = skipLogic
    const normalizedData = normalize(data, schema)
    store.init(
      data, results, user, campaign,
      userReport.reportData || [], userReport.campaignFactorResults || [], userReport.campaignAiArtifactResults || [],
    )
    rstore.dispatch(init(normalizedData, userReport))

    this.setState({ selectedLocale })
    const visiblePages = _.filter(PageList.list, page => LogicResolver.run(page.displayLogic))
    setPages && setPages(visiblePages)
  }

  componentDidUpdate (prevProps) {
    const { skipLogic } = this.props
    if (prevProps.skipLogic !== skipLogic) {
      rstore.dispatch(changeSkipLogic(skipLogic))
    }
  }

  componentWillUnmount () {
    store.reinit()
  }

  render () {
    const {
      userReport, userReport: { moduleOverrides }, dashboard, allowEdit, allowApprove, aiTranslations,
    } = this.props

    return (
      <Provider store={rstore} key={userReport.id}>
        <ErrorBoundary fallbackRender={() => <ErrorWarning />}>
          <div className="row" style={{ direction: 'ltr' }}>
            <Preview
              key={userReport.id}
              rstore={globalStore}
              localeDirection={_.get(this.state, 'selectedLocale.direction', 'ltr')}
              allowEdit={allowEdit}
              allowApprove={allowApprove}
              moduleOverrides={moduleOverrides}
              dashboard={dashboard}
              aiTranslations={aiTranslations}
            />
          </div>
        </ErrorBoundary>
      </Provider>
    )
  }
}

export default ReportContainer
