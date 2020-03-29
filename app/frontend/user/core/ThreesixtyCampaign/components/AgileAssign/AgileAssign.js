import React, { useEffect } from 'react'
import {
  Layout, Icon, PageHeader,
} from 'antd'
import { InteractiveAssessments } from '@thetalententerprise/interactive-assessments'

const { Content } = Layout

export default function AgileAssign ({
  history,
  isFrame,
  agileAssetsUrl,
}) {
  const initializeAgile = () => {
    const appOptions = {
      scale: {
        parent: 'agile-container',
      },
      service: {
        baseURL: window.location.href,
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'X-CSRF-Token': document.querySelector("meta[name='csrf-token']").getAttribute('content'),
        },
      },
      settings: {
        returnURL: '/',
        assetsBaseURL: agileAssetsUrl,
      },
    }

    InteractiveAssessments.init(appOptions)
  }

  useEffect(() => {
    initializeAgile()
  }, [])

  return (
    <Layout>
      <Content className="fluid-container">
        <PageHeader
          className="page-header"
          backIcon={!isFrame && (
            <div>
              <Icon type="arrow-left" />
              {' '}
              Back
            </div>
          )}
          onBack={() => history.push('/campaigns')}
        >
          <div id="agile-container" />
          <div className="mbl" />
        </PageHeader>
      </Content>
    </Layout>
  )
}
