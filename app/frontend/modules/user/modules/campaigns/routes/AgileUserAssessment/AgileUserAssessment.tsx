import React, { useEffect } from 'react'
import {
  Layout, PageHeader,
} from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'
import { InteractiveAssessments } from '@thetalententerprise/interactive-assessments'
import { withRouter, RouteComponentProps } from 'react-router-dom'
import './styles.scss'
import { PropsFromRedux } from './connect'

const { Content } = Layout

interface OwnProps {
  agileUserAssessmentUrl?: string
}

type Props = OwnProps & PropsFromRedux & RouteComponentProps

const AgileUserAssessment: React.FC<Props> = ({
  history,
  isFrame,
  agileAssetsUrl,
  agileUserAssessmentUrl,
  isAnonym,
}) => {
  const initializeAgile = () => {
    const appOptions = {
      scale: {
        parent: 'agile-container',
      },
      service: {
        baseURL: agileUserAssessmentUrl || window.location.href,
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'X-CSRF-Token': document.querySelector("meta[name='csrf-token']")?.getAttribute('content') as string,
        },
      },
      settings: {
        returnURL: isAnonym ? '' : '/',
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
          title={null}
          className="page-header"
          backIcon={!isFrame && (
            <div>
              <ArrowLeftOutlined />
              {' '}
              Back
            </div>
          )}
          onBack={() => history.push('/campaigns')}
        >
          <div id="agile-container" className="agile-container" />
          <div className="mbl" />
        </PageHeader>
      </Content>
    </Layout>
  )
}

export default withRouter(AgileUserAssessment)
