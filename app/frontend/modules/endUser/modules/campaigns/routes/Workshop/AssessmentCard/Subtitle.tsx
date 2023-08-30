import React, { FC } from 'react'
import { Space } from 'antd'
import moment from 'moment'
import { CountdownTimer } from '~/glint'
import { TimerText } from '~/modules/endUser/modules/campaigns/components/TimerText'

const { I18n } = window

interface Props {
  assessment: {
    workshopActivityDuration: number
    scheduleTime: string,
  },
  workshop: {
    attended: boolean
  },
  setCardActionDisabled: (boolean) => void
}

export const Subtitle: FC<Props> = ({ assessment, setCardActionDisabled, workshop }) => (
  <Space direction="vertical">
    {assessment.workshopActivityDuration && (
      <Space>
        {I18n.t('campaign.workshops.duration')}
        <TimerText text={
          // eslint-disable-next-line max-len
          I18n.t('campaign.workshops.duration_to_complete', { duration: moment(assessment.workshopActivityDuration * 1000).utc().format('mm') })}
        />
      </Space>
    )}

    {assessment.scheduleTime && moment().isBefore(moment(assessment.scheduleTime)) && workshop.attended && (
      <div>
        <Space>
          {I18n.t('campaign.workshops.starts_in')}
          <TimerText
            text={(
              <CountdownTimer
                onFinish={() => setCardActionDisabled(false)}
                seconds={moment(assessment.scheduleTime).diff(moment(), 's')}
              />
            )}
          />
        </Space>
      </div>
    )}
  </Space>
)
