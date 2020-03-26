import React, { useEffect } from 'react'
import {
  Layout, Icon, PageHeader,
} from 'antd'
import { InteractiveAssessments } from '@thetalententerprise/interactive-assessments'

const { Content } = Layout

export default function GameAssign ({
  history,
  isFrame,
  gameAssetsUrl,
}) {

  const initializeGame = () => {
    const appOptions = {
      scale: {
        parent: 'game-container',
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
        assetsBaseURL: gameAssetsUrl,
      },
    }

    InteractiveAssessments.init(appOptions)
  }

  useEffect(() => {
    initializeGame()
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
          <div id="game-container" />
        </PageHeader>
      </Content>
    </Layout>
  )
}
