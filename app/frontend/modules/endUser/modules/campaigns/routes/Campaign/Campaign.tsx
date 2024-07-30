import { useEffect, FC } from 'react'
import {
  Layout, Flex,
} from 'antd'
import { ClockCircleOutlined } from '@ant-design/icons'
import { connect, ConnectedProps } from 'react-redux'
import { RouteComponentProps } from 'react-router-dom'

import { fetchCampaign, reset as resetCampaign } from '~/modules/endUser/modules/campaigns/core/campaign'
import { RootState } from '~/modules/endUser/core/rootReducers'

import { PageContentSkeleton } from '~/modules/endUser/modules/campaigns/components/PageContentSkeleton'
import LangDropdown from '~/components/LangDropdown'
import { PageHeader, CountdownTimer } from '~/glint'
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
type Params = {
  url: string
}

type CampaignComponentProps = RouteComponentProps<Params> & PropsFromRedux

const CampaignComponent: FC<CampaignComponentProps> = ({
  history,
  match,
  fetchCampaign,
  campaign,
  loaded,
  resetCampaign,
}) => {
  useEffect(() => {
    fetchCampaign(match.url)

    return () => {
      resetCampaign()
    }
  }, [match.url])

  const notificationDurations: Notification[] = [
    { completionPercentage: 50, type: 'info' },
    { completionPercentage: 75, type: 'warning' },
    { completionPercentage: 90, type: 'error' },
  ]
  const notificationMessage = (minutes: number, seconds: number) => (
    I18n.t('campaign.timer.notification', { minutes, seconds })
  )
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
              onFinish={() => fetchCampaign(match.url)}
            />
          ) : <div className="p-1" />}
        </Flex>
        <LangDropdown />
      </Flex>
    </>

  )

  const Campaign = TYPES[campaign.type]
  return (
    <>
      <PageHeader>{headerElement}</PageHeader>
      <Content className={styles.pageContent}>
        { loaded ? <Campaign history={history} match={match} />
          : (
            <PageContentSkeleton />
          )}
      </Content>
    </>
  )
}

export const Campaign = connector(CampaignComponent)
