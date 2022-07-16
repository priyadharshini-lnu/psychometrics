import React, { Component } from 'react'
import store from 'modules/reports/store/PreviewStore'
import PageList from 'modules/reports/store/PageList'
import LogicResolver from 'modules/reports/models/logic/LogicResolver'
import Page from './Page'

export class Preview extends Component {
  componentDidMount () {
    this.storeListener = store.addListener('change', () => this.forceUpdate())
  }

  componentWillUnmount () {
    this.storeListener.remove()
  }

  storeListener = null

  render () {
    const {
      localeDirection, loaded, showOverrides, rstore, moduleOverrides, pdfExport, skipLogic,
    } = this.props
    if (!loaded) { return null }
    const visiblePages = skipLogic
      ? PageList.list
      : _.filter(PageList.list, page => LogicResolver.run(page.displayLogic))
    return (
      <div style={{ position: 'relative' }} className={localeDirection}>
        {visiblePages.map((page, i) => (
          <Page
            model={page}
            key={i}
            pageNumber={i + 1}
            totalPages={visiblePages.length}
            rstore={rstore}
            showOverrides={showOverrides}
            moduleOverrides={moduleOverrides}
            pdfExport={pdfExport}
          />
        ))}
      </div>
    )
  }
}

export default Preview
