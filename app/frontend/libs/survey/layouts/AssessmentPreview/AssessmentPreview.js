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
    const { end, initialized } = this.props
    if (!initialized) { return null }
    return (
      end ? <EndPage /> : <Page />
    )
  }
}

export default AssessmentPreview
