import React from 'react'
import Page from 'views/Preview/Page'
import EndPage from 'views/Preview/EndPage'

const AssessmentPreview = ({ end, initialized }) => {
  if (!initialized) { return null }
  return (
    end ? <EndPage /> : <Page />
  )
}

export default AssessmentPreview
