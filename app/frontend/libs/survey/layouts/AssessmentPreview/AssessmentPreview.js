import React, { useEffect } from 'react'
import Page from 'views/Preview/Page'
import EndPage from 'views/Preview/EndPage'
import store from 'store/AssessmentPreviewStore'
import { InteractiveAssessments } from '@thetalententerprise/interactive-assessments'

const AssessmentPreview = ({ end, initialized }) => {
  isAgile = () => store.assessment && store.assessment.category === 'agile'

  useEffect(() => {
    initializeAgile()
  }, [])

  const initializeAgile = () => {
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

  if (!initialized) { return null }

  if (isAgile()) {
    return (
      <div>
        <div id="agile-container" />
      </div>
    )
  }

  return (
    end ? <EndPage /> : <Page />
  )
}

export default AssessmentPreview
