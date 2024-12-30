import { Component } from 'react'
import _ from 'lodash'
import PropTypes from 'prop-types'
import cs from 'classnames'
import { ErrorBoundary } from 'react-error-boundary'
import { Modules } from '~/modules/reports/components/modules/Previews'
import store from '~/modules/reports/store/PageList'
import AppStore from '~/modules/reports/store/AppStore'
import styles from './Page.less'

class Page extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
    pageNumber: PropTypes.number.isRequired,
    totalPages: PropTypes.number.isRequired,
  }

  renderModuleType = (module, i) => {
    const {
      model, pageNumber, flipContent, totalPages, rstore, moduleOverrides, pdfExport, dashboard,
    } = this.props
    if (dashboard && module.props.hideOnDashboard) { return null }
    if (!module.type) { return }
    const View = Modules[module.type]

    return (
      <ErrorBoundary
        key={i}
        fallbackRender={() => (
          <Modules.Error module={module} page={model} preview />
        )}
      >
        <View
          module={module}
          page={model}
          flipContent={flipContent}
          preview
          pageNumber={pageNumber}
          totalPages={totalPages}
          rstore={rstore}
          moduleOverrides={moduleOverrides}
          animation={!pdfExport}
        />
      </ErrorBoundary>
    )
  }

  renderShadowModule = (module, i) => {
    const {
      model, pageNumber, totalPages, pdfExport, dashboard, flipContent,
    } = this.props
    if (dashboard && module.props.hideOnDashboard) { return null }
    if (module.onPage(model)) { return }
    const View = Modules[module.type]
    return (
      <ErrorBoundary
        key={i}
        fallbackRender={() => (
          <Modules.Error module={module} page={model} preview />
        )}
      >
        <View
          module={module}
          page={model}
          flipContent={flipContent}
          preview
          pageNumber={pageNumber}
          totalPages={totalPages}
          animation={!pdfExport}
        />
      </ErrorBoundary>
    )
  }

  render () {
    const { model = {}, pdfExport, dashboard } = this.props
    const style = {
      ...AppStore.report.props.sizes,
    }

    if (!pdfExport && dashboard) {
      const max = _.reduce([...model.modules.list, ...store.showOnAllPages.list], (max, m) => {
        if (m.props.hideOnDashboard) { return max }
        const point = m.props.position.top + m.props.position.height
        return (point > max) ? point : max
      }, 0)

      style.height = max
    }

    return (
      <div className={cs(styles.page, { [styles.dashboard]: !pdfExport })} name={`Page#${model.id}`}>
        <div className={`${styles.pageContainer} fe-page-container`} style={style}>
          <div className={styles.pageContent}>
            {model.modules.list.map(this.renderModuleType)}
            {store.showOnAllPages.list.map(this.renderShadowModule)}
          </div>
        </div>
      </div>
    )
  }
}

export default Page
