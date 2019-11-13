import React, { Component } from 'react'
import Page from 'views/Preview/Page'
import EndPage from 'views/Preview/EndPage'
import store from 'store/AssessmentPreviewStore'

export class AssessmentPreview extends Component {
  storeListener = null

  componentDidMount () {
    this.storeListener = store.addListener('change', () => this.forceUpdate())
  }

  componentWillUnmount () {
    this.storeListener.remove()
  }

  render () {
    const page = store.currentPage()
    if (!page) { return null }
    return (
      page.end ? <EndPage page={page} /> : <Page page={page} />
    )
  }
}

export default AssessmentPreview
