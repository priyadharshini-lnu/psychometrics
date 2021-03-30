import React, { useEffect } from 'react'
import {
  Layout,
} from 'antd'
import { InteractiveAssessments } from '@thetalententerprise/interactive-assessments'
import { withRouter, RouteComponentProps } from 'react-router-dom'
import qs from 'qs'
import './styles.scss'
import { PropsFromRedux } from './connect'

const { Content } = Layout

interface OwnProps {
  agileUserAssessmentUrl?: string
}

type Props = OwnProps & PropsFromRedux & RouteComponentProps

const AgileUserAssessment: React.FC<Props> = ({
  // isFrame,
  agileAssetsUrl,
  agileUserAssessmentUrl,
  isAnonym,
  campaignId,
}) => {
  const initializeAgile = () => {
    const { lang } = qs.parse(location.search.substr(1))
    const appOptions = {
      scale: {
        parent: 'agile-container',
      },
      service: {
        baseURL: agileUserAssessmentUrl || window.location.href.split('?')[0],
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'X-CSRF-Token': document.querySelector("meta[name='csrf-token']")?.getAttribute('content') as string,
        },
      },
      settings: {
        returnURL: isAnonym ? '' : `/campaigns/${campaignId}`,
        assetsBaseURL: agileAssetsUrl,
        locale: lang?.toString(),
      },
    }

    InteractiveAssessments.init(appOptions)
  }

  useEffect(() => {
    initializeAgile()
  }, [])

  return (
    <Layout className="agile-layout">
      <Content className="agile-content mtm mbm">
        <div id="agile-container" className="agile-container" />
      </Content>
    </Layout>
  )
}

export default withRouter(AgileUserAssessment)
