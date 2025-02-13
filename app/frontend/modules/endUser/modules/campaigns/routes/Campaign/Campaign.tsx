import { useEffect, FC } from 'react'
import {
  Layout, Flex, Space,
} from 'antd'
import { connect, ConnectedProps } from 'react-redux'

import { useLocation } from 'react-router-dom'
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

const CampaignComponent: FC<CampaignComponentProps> = ({
  fetchCampaign,
  campaign,
  loaded,
  resetCampaign,
}) => {
  const location = useLocation()
  useEffect(() => {
    fetchCampaign(location.pathname)
    return () => {
      resetCampaign()
    }
  }, [location.pathname])

  const notificationDurations: Notification[] = [
    { timeRemaining: 3600, type: 'info' },
    { timeRemaining: 1800, type: 'warning' },
    { timeRemaining: 900, type: 'error' },
  ]
  const notificationMessage = (minutes: number) => {
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60)
      return I18n.t('campaign.timer.notification_hours', { hours })
    } return I18n.t('campaign.timer.notification_minutes', { minutes })
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
