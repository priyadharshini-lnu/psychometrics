import { useEffect, FC } from 'react'
import {
  Layout, Flex, Space,
} from 'antd'
import { connect, ConnectedProps } from 'react-redux'

import { useLocation, useNavigate } from 'react-router-dom'
import { ClockCircleOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import { fetchCampaign, reset as resetCampaign } from '~/modules/endUser/modules/campaigns/core/campaign'
import { RootState } from '~/modules/endUser/core/rootReducers'

import { PageContentSkeleton } from '~/modules/endUser/modules/campaigns/components/PageContentSkeleton'
import { LangDropdownWithChangeLocale } from '~/components/LangDropdown'
import { PageHeader, CountdownTimer, FontsizeModifier } from '~/glint'
import { Common } from './Common'
import { Threesixty } from './Threesixty'
import { secondsLeftFromNow } from '~/utils/time'
import { Notification } from '~/glint/components/CountdownTimer'

import styles from './styles.less'

const TYPES = {
  common: Common,
  threesixty: Threesixty,
}
const { Content } = Layout
const { I18n } = window

const connector = connect(
  (state: RootState) => ({
    loaded: state.campaigns.campaign.loaded,
    campaign: state.campaigns.campaign,
  }),
  {
    fetchCampaign,
    resetCampaign,
  },
)

type PropsFromRedux = ConnectedProps<typeof connector>
type CampaignComponentProps = PropsFromRedux

type CommonCampaignDetails= {
  campaignOptions: {
    systemCheckEnabled: boolean,
    systemCheckValidity: number,
  },
  lastSuccessfulCheckAt: number,
  type:string,
  id: number
  systemCheckStatus: {
    isValid: boolean,
  } | null
  userAssessments: Array<{
    status: string,
  }>
}

type ThreeSixtyCampaignDetails= {
  options: {
    participants: {
      global: {
        systemCheckEnabled: boolean,
        systemCheckValidity: number,
      },
    }
  }
  lastSuccessfulCheckAt: number,
  type:string,
  campaignId: number
  systemCheckStatus: {
    isValid: boolean,
  } | null
}

type CampaignDetails = CommonCampaignDetails | ThreeSixtyCampaignDetails | {type:string}

const CampaignComponent: FC<CampaignComponentProps> = ({
  fetchCampaign,
  campaign,
  loaded,
  resetCampaign,
}) => {
  const location = useLocation()

  const navigate = useNavigate()
  useEffect(() => {
    fetchCampaign(location.pathname).then(({ response }) => {
      if ((response as CampaignDetails).type === 'common') {
        const {
          campaignOptions, id, systemCheckStatus, userAssessments,
        } = response as CommonCampaignDetails
        const { systemCheckEnabled } = campaignOptions

        if (systemCheckEnabled && systemCheckStatus !== null) {
          const { isValid } = systemCheckStatus

          const hasCompletedAllAssessment = userAssessments.every(assessment => assessment.status === 'completed')

          if (systemCheckEnabled && !isValid && !hasCompletedAllAssessment) {
            navigate(`/campaign_system_check/${id}/welcome`)
          }
        }
      }

      if ((response as CampaignDetails).type === 'threesixty') {
        const {
          options, campaignId, systemCheckStatus,
        } = response as ThreeSixtyCampaignDetails
        const { systemCheckEnabled } = options.participants.global

        if (systemCheckEnabled && systemCheckStatus !== null) {
          const { isValid } = systemCheckStatus

          if (systemCheckEnabled && !isValid) {
            navigate(`/campaign_system_check/${campaignId}/welcome`)
          }
        }
      }
    })

    return () => {
      resetCampaign()
    }
  }, [location.pathname])

  const notificationDurations: Notification[] = [
    { timeRemaining: 3600, type: 'info' },
    { timeRemaining: 1800, type: 'warning' },
    { timeRemaining: 900, type: 'error' },
  ]
  const notificationMessage = (minutes: number, seconds: number) => {
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60)
      return I18n.t('campaign.timer.notification_hours', { hours })
    }
    if (seconds > 0) {
      return I18n.t('campaign.timer.notification_minutes_seconds', { minutes, seconds })
    }
    return I18n.t('campaign.timer.notification_minutes', { minutes })
  }
  const expiryDate = campaign?.campaignUser?.expiryDate
  const isTimedCampaign = campaign?.isTimedCampaign
  const remainingCampaignTime = secondsLeftFromNow(expiryDate)
  const headerElement = (
    <>
      <Flex flex="auto" className="ms-8">
        <Flex justify="center" align="center" flex="auto">
          {isTimedCampaign && remainingCampaignTime ? (
            <CountdownTimer
              prefix={(
                <>
                  {I18n.t('user_assessments.timer_title.campaign')}
                  {': '}
                  <ClockCircleOutlined />
                </>
              )}
              notificationPoints={notificationDurations}
              notificationTemplate={notificationMessage}
              seconds={remainingCampaignTime}
              onFinish={() => fetchCampaign(location.pathname)}
              safeTimer
            />
          ) : <div className="p-1" />}
        </Flex>
        <Space>
          <FontsizeModifier />
          <LangDropdownWithChangeLocale />
        </Space>
      </Flex>
    </>

  )
  const Campaign = TYPES[campaign.type]
  return (
    <>
      <title>{`${I18n.t('user_assessments.timer_title.campaign')} - ${I18n.t('frontend.lighthouse_app')}`}</title>
      <PageHeader>{headerElement}</PageHeader>
      <Content className={styles.pageContent}>
        { loaded ? <Campaign />
          : (
            <PageContentSkeleton />
          )}
      </Content>
    </>
  )
}

export const Campaign = connector(CampaignComponent)
