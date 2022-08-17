import React, { useEffect } from 'react'
import {
  Layout,
} from 'antd'
import { InteractiveAssessments } from '@thetalententerprise/interactive-assessments'
import { withRouter, RouteComponentProps } from 'react-router-dom'
import { connect, ConnectedProps } from 'react-redux'
import qs from 'qs'

import { get as getConfig } from 'modules/user/core/config'
import { RootState } from 'modules/user/core/rootReducers'
import { get as getCurrentUser } from 'core/currentUser'
import { get as getCampaign } from 'modules/user/modules/campaigns/core/campaign/selectors'

import styles from './styles.less'

const connector = connect(
  (state: RootState) => ({
    ...getConfig(state),
    isAnonym: getCurrentUser(state).isAnonym,
    campaignId: getCampaign(state).id,
  }),
  {},
)

export type PropsFromRedux = ConnectedProps<typeof connector>

const { Content } = Layout

interface OwnProps {
  agileUserAssessmentUrl?: string
}

type Props = OwnProps & PropsFromRedux & RouteComponentProps

const AgileUserAssessmentComponent: React.FC<Props> = ({
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
        returnURL: isAnonym ? '' : `/assessment_completed/${campaignId}`,
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
    <Content className={styles.agileContent}>
      <div id="agile-container" className={styles.agileContainer} />
    </Content>
  )
}

export const AgileUserAssessment = connector(withRouter(AgileUserAssessmentComponent))
