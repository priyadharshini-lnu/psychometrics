import React, { useEffect, useState } from 'react'
import {
  Col,
  Layout,
} from 'antd'
import { ClockCircleOutlined } from '@ant-design/icons'
import { useNavigate, useParams } from 'react-router-dom'
import { connect, ConnectedProps } from 'react-redux'
import qs from 'qs'

import { SubHeader } from '~/modules/endUser/modules/campaigns/components/SubHeader'
import { get as getConfig } from '~/modules/endUser/core/config'
import { isRequestInProgress } from '~/core/request'
import { RootState } from '~/modules/endUser/core/rootReducers'
import { get as getCurrentUser } from '~/core/currentUser'
import {
  get as getCampaign, getUserAssessmentData, getCampaignOptions,
} from '~/modules/endUser/modules/campaigns/core/campaign/selectors'
import {
  fetchAssessment, getCampaignRemainingTime, FETCH_RESULTS,
} from '~/modules/endUser/modules/campaigns/core/userAssessment'
import styles from './styles.less'
import { CountdownTimer, PageHeader as GlintPageHeader } from '~/glint'

const InteractiveAssessmentsModule = () => import('@thetalententerprise/interactive-assessments')

const connector = connect(
  (state: RootState) => ({
    ...getConfig(state),
    isAnonym: getCurrentUser(state).isAnonym,
    campaignId: getCampaign(state).id,
    userAssessment: getUserAssessmentData(state),
    assessment: state.campaigns.userAssessment.assessment,
    remainingCampaignTime: getCampaignRemainingTime(state),
    campaignOptions: getCampaignOptions(state),
    resultsLoading: isRequestInProgress(state, FETCH_RESULTS),
  }),
  {
    fetchAssessment,
  },
)

export type PropsFromRedux = ConnectedProps<typeof connector>

const { Content } = Layout
const { I18n } = window

type Params = {
  userAssessmentId: string
}
interface OwnProps {
  agileUserAssessmentUrl?: string
}

type Props = OwnProps & PropsFromRedux

const AgileUserAssessmentComponent: React.FC<Props> = ({
  agileAssetsUrl,
  agileUserAssessmentUrl,
  isAnonym,
  campaignId: agileCampaign,
  assessment,
  userAssessment,
  fetchAssessment,
  remainingCampaignTime,
  campaignOptions,
  resultsLoading,
}) => {
  const campaignId = agileCampaign || userAssessment.campaignId
  const navigate = useNavigate()
  const params = useParams() as Params

  const [assessmentLoading, setAssessmentLoading] = useState(true)
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
        watermark: campaignOptions?.show_watermark ? campaignOptions.watermark_content : null,
      },
    }
    InteractiveAssessmentsModule().then(({ InteractiveAssessments }) => {
      InteractiveAssessments.init(appOptions)
    })
  }

  useEffect(() => {
    const { edit } = qs.parse(location.search.substr(1))
    fetchAssessment(params.userAssessmentId, edit).then(() => {
      setAssessmentLoading(false)
    })
  }, [])

  useEffect(() => {
    if (!assessmentLoading && !resultsLoading) {
      initializeAgile()
    }
  }, [assessmentLoading, resultsLoading])

  const notificationMessage = (minutes: number, seconds: number) => (
    I18n.t('campaign.timer.notification', { minutes, seconds })
  )

  return (
    <>
      {remainingCampaignTime > 0 && (
      <GlintPageHeader>
        <Col span={16} className="ta-c">
          <CountdownTimer
            prefix={(
              <>
                {I18n.t('user_assessments.timer_title.campaign')}
                {': '}
                <ClockCircleOutlined />
              </>
            )}
            // notificationPoints={notificationDurations}
            notificationTemplate={notificationMessage}
            seconds={remainingCampaignTime}
          />
        </Col>
      </GlintPageHeader>
      )}
      <SubHeader
        title={assessment.name}
        onBack={() => navigate(`/campaigns/${campaignId}`)}
        backButtonAriaLabel={I18n.t('frontend.aria.back_to_tasks')}
      />
      <Content className={styles.agileContent}>
        <div id="agile-container" className={styles.agileContainer} />
      </Content>
    </>
  )
}

export const AgileUserAssessment = connector(AgileUserAssessmentComponent)
