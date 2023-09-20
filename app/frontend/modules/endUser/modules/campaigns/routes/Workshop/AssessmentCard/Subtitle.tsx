import React, { FC } from 'react'
import { Space } from 'antd'
import moment from 'moment'
import { CountdownTimer } from '~/glint'
import { TimerText } from '~/modules/endUser/modules/campaigns/components/TimerText'
import { secondsToDayHoursAndMinutes } from '~/utils/time'

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
      <TimerText text={
        I18n.t('campaign.workshops.duration_to_complete',
          { duration: secondsToDayHoursAndMinutes(assessment.workshopActivityDuration * 60, undefined, 'hr', 'mins') })}
      />
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
