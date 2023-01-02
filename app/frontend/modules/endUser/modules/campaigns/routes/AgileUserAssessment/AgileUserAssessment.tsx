import React, { useEffect } from 'react'
import {
  Layout,
} from 'antd'
import { InteractiveAssessments } from '@thetalententerprise/interactive-assessments'
import { withRouter, RouteComponentProps, useHistory } from 'react-router-dom'
import { connect, ConnectedProps } from 'react-redux'
import qs from 'qs'

import { SubHeader } from 'modules/endUser/modules/campaigns/components/SubHeader'
import { get as getConfig } from 'modules/endUser/core/config'
import { RootState } from 'modules/endUser/core/rootReducers'
import { get as getCurrentUser } from 'core/currentUser'
import { get as getCampaign } from 'modules/endUser/modules/campaigns/core/campaign/selectors'
import { fetchAssessment } from 'modules/endUser/modules/campaigns/core/userAssessment'

import styles from './styles.less'

const connector = connect(
  (state: RootState) => ({
    ...getConfig(state),
    isAnonym: getCurrentUser(state).isAnonym,
    campaignId: getCampaign(state).id,
    assessment: state.campaigns.userAssessment.assessment,
  }),
  {
    fetchAssessment,
  },
)

export type PropsFromRedux = ConnectedProps<typeof connector>

const { Content } = Layout

type Params = {
  userAssessmentId: string
}
interface OwnProps {
  agileUserAssessmentUrl?: string
}

type Props = OwnProps & PropsFromRedux & RouteComponentProps<Params>

const AgileUserAssessmentComponent: React.FC<Props> = ({
  agileAssetsUrl,
  agileUserAssessmentUrl,
  isAnonym,
  campaignId,
  assessment,
  fetchAssessment,
  match: { params },
}) => {
  const history = useHistory()
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

  useEffect(() => {
    const { edit } = qs.parse(location.search.substr(1))
    fetchAssessment(params.userAssessmentId, edit)
  }, [])

  return (
    <>
      <SubHeader
        title={assessment.name}
        onBack={() => history.push(`/campaigns/${campaignId}`)}
      />
      <Content className={styles.agileContent}>
        <div id="agile-container" className={styles.agileContainer} />
      </Content>
    </>
  )
}

export const AgileUserAssessment = connector(withRouter(AgileUserAssessmentComponent))
