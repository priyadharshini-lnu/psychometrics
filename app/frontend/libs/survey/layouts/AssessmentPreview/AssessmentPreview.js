import React, { Component } from 'react'
import Page from 'views/Preview/Page'
import EndPage from 'views/Preview/EndPage'
import store from 'store/AssessmentPreviewStore'
import { InteractiveAssessments } from '@thetalententerprise/interactive-assessments'

export class AssessmentPreview extends Component {
  storeListener = null

  componentDidMount () {
    this.storeListener = store.addListener('change', () => {
      this.forceUpdate()
      setTimeout(() => this.isAgile() && this.initializeAgile(), 2000)
    })
  }

  componentWillUnmount () {
    this.storeListener.remove()
  }

  isAgile = () => store.assessment && store.assessment.category === 'agile'

  initializeAgile = () => {
    const appOptions = {
      scale: {
        parent: 'agile-container',
      },
      service: {
        baseURL: store.agileAssignUrl,
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'X-CSRF-Token': document.querySelector("meta[name='csrf-token']").getAttribute('content'),
        },
      },
      settings: {
        returnURL: '',
        assetsBaseURL: store.agileAssetsUrl,
      },
    }

    InteractiveAssessments.init(appOptions)
  }

  render () {
    if (!store.assessment) { return null }

    if (this.isAgile()) {
      return (
        <div>
          <div id="agile-container" />
        </div>
      )
    }
    const page = store.currentPage()
    if (!page) { return null }
    return (
      page.end ? <EndPage page={page} /> : <Page page={page} />
    )
  }
}

export default AssessmentPreview
