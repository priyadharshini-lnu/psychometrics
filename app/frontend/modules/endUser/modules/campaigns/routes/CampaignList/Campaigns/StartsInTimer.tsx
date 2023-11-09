import { FC, useState } from 'react'
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
    scheduledIn: number
    scheduledAt: string
    scheduledDate: string
    timing: string
    status: string
  },
  scheduledForFuture: boolean
  fetchCampaigns: () => void
}
export const StartsInTimer: FC<Props> = ({ campaign, fetchCampaigns, scheduledForFuture }) => {
  const { scheduledIn, scheduledAt } = campaign
  let hoursRemaining = 0
  let timeIsInPast = false
  let date: null | string = null
  if (scheduledIn) {
    hoursRemaining = scheduledIn / 3600
    timeIsInPast = scheduledIn <= 0
    date = moment(scheduledAt).format('Do MMMM YYYY hh:mm A Z')
  }


  const [refreshDelay, setRefreshDelay] = useState<null | number>(timeIsInPast ? randomWholeNumber(15000, 30000) : null)

  useTimeout(() => {
    fetchCampaigns()
    setRandomDelaysForRefresh()
  }, scheduledForFuture ? refreshDelay : null)

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
      {scheduledForFuture
        && hoursRemaining >= 24 && I18n.t('campaigns.card.starts_on', { date })}
      {scheduledForFuture && hoursRemaining < 24 && !timeIsInPast && (
        <Space>
          {I18n.t('campaigns.card.starts_in')}
          <CountdownTimer
            prefix={<ClockCircleOutlined />}
            seconds={scheduledIn}
            valueStyle={{ fontWeight: 'bold' }}
            onFinish={() => setRefreshDelay(0)}
          />
        </Space>
      )}
      {scheduledForFuture && timeIsInPast && (
        <Space>
          {I18n.t('campaigns.card.will_start_shortly')}
          <LoadingOutlined />
        </Space>
      )}
    </Space>
  )
}
