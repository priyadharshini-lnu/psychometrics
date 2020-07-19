import React, { useEffect } from 'react'
import Page from 'views/Preview/Page'
import EndPage from 'views/Preview/EndPage'
import { InteractiveAssessments } from '@thetalententerprise/interactive-assessments'

const AssessmentPreview = ({
  end, initialized, assessmentCategory, agileAssignUrl, agileAssetsUrl,
}) => {
  const isAgile = () => assessmentCategory === 'agile'

  useEffect(() => {
    isAgile() && initializeAgile()
  }, [])

  const initializeAgile = () => {
    const appOptions = {
      scale: {
        parent: 'agile-container',
      },
      service: {
        baseURL: agileAssignUrl,
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'X-CSRF-Token': document.querySelector("meta[name='csrf-token']").getAttribute('content'),
        },
      },
      settings: {
        returnURL: '',
        assetsBaseURL: agileAssetsUrl,
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
