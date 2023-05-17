import React, { FC, useState } from 'react'
import moment from 'moment'
import { Descriptions, Space } from 'antd'
import { ClockCircleOutlined, LoadingOutlined } from '@ant-design/icons'
import { TimerText } from '~/modules/endUser/modules/campaigns/components/TimerText'
import { CountdownTimer } from '~/glint'
import { useTimeout } from '~/hooks/useTimeout'
import { randomWholeNumber } from '~/utils/number'

const { I18n } = window

interface Props {
  campaign: {
    startDate: string
    timing: string
    status: string
  },
  fetchCampaigns: () => void
}
export const StartsInTimer: FC<Props> = ({ campaign, fetchCampaigns }) => {
  const [refreshDelay, setRefreshDelay] = useState<null | number>(null)
  const isInactive = campaign.status === 'inactive'

  useTimeout(() => {
    fetchCampaigns()
    setRandomDelaysForRefresh()
  }, isInactive ? refreshDelay : null)

  const hoursRemaining = moment(campaign.startDate).diff(moment(), 'hours')
  const secondsRemaining = moment(campaign.startDate).diff(moment(), 'seconds')
  const timeIsInPast = secondsRemaining <= 0
  const startDateWithTimezone = () => moment(campaign.startDate).format('Do MMMM YYYY hh:mm Z')

  const setRandomDelaysForRefresh = () => {
    setRefreshDelay(randomWholeNumber(15000, 30000))
  }

  const duration = () => {
    if (/^\d+$/.test(campaign.timing)) {
      return moment.duration(campaign.timing, 'seconds').humanize()
    }
    return campaign.timing
  }

  return (
    <Space direction="vertical">
      {campaign.timing && (
        <Descriptions size="small">
          <Descriptions.Item label={I18n.t('campaigns.card.duration')}>
            <TimerText text={duration()} />
          </Descriptions.Item>
        </Descriptions>
      )}
      {isInactive && hoursRemaining >= 24 && I18n.t('campaigns.card.starts_on', { date: startDateWithTimezone() })}
      {isInactive && hoursRemaining < 24 && !timeIsInPast && (
        <Space>
          {I18n.t('campaigns.card.starts_in')}
          <CountdownTimer
            prefix={<ClockCircleOutlined />}
            seconds={secondsRemaining}
            valueStyle={{ fontWeight: 'bold' }}
            onFinish={() => setRefreshDelay(0)}
          />
        </Space>
      )}
      {isInactive && timeIsInPast && (
        <Space>
          {I18n.t('campaigns.card.will_start_shortly')}
          <LoadingOutlined />
        </Space>
      )}
    </Space>
  )
}
