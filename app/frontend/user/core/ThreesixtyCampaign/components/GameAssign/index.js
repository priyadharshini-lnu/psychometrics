import React, { useEffect } from 'react'
import {
  Layout, Icon, PageHeader
} from 'antd'
import { InteractiveAssessments } from "@thetalententerprise/interactive-assessments"

const { Content } = Layout

export default function GameAssign({
  history,
  isFrame,
}) {
  useEffect(() => {
    initializeGame()
  }, [])

  const initializeGame = () => {
    const appOptions = {
      scale: {
        parent: "game-container"
      },
      service: {
        baseURL: "http://75f.lvh.me:3030/game/assigns/156427",
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'X-CSRF-Token': document.querySelector("meta[name='csrf-token']").getAttribute('content'),
        },
      },
      settings: {
        returnURL: "https://xyz.tte-lighthouse.com.com",
        assetsBaseURL: "https://tte-static.s3.eu-west-1.amazonaws.com/interactive-assessments/",
      }
    }
    window.gameApp = InteractiveAssessments.init(appOptions)
  }

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
          title={(
            <div>
            </div>
          )}
          onBack={() => history.push('/campaigns')}
        >
          <div id='game-container' className='evaluation-container'>

          </div>
        </PageHeader>
      </Content>
    </Layout>
  )
}
