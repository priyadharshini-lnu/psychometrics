import { Component } from 'react'
import _ from 'lodash'
import store from '~/modules/reports/store/PreviewStore'
import PageList from '~/modules/reports/store/PageList'
import LogicResolver from '~/modules/reports/models/logic/LogicResolver'
import Page from './Page'
import { ModuleOverrides } from './ModuleOverrides'

export class Preview extends Component {
  storeListener = null

  componentDidMount () {
    this.storeListener = store.addListener('change', () => this.forceUpdate())
  }

  componentWillUnmount () {
    this.storeListener.remove()
  }

  render () {
    const {
      loaded, rstore, moduleOverrides, pdfExport, skipLogic, dashboard,
      allowEdit, allowApprove, flipContent,
    } = this.props
    if (!loaded) { return null }
    const visiblePages = skipLogic
      ? PageList.list
      : _.filter(PageList.list, page => LogicResolver.run(page.displayLogic))
    return (
      <div style={{ position: 'relative', direction: 'ltr' }}>
        {visiblePages.map((page, i) => (
          <Page
            model={page}
            key={i}
            flipContent={flipContent}
            pageNumber={i + 1}
            totalPages={visiblePages.length}
            rstore={rstore}
            moduleOverrides={moduleOverrides}
            pdfExport={pdfExport}
            dashboard={dashboard}
          />
        ))}
        {!pdfExport && (
          <ModuleOverrides
            allowEdit={allowEdit}
            allowApprove={allowApprove}
            pages={visiblePages}
            rstore={rstore}
            moduleOverrides={moduleOverrides}
          />
        )}
      </div>
    )
  }
}

export default Preview
