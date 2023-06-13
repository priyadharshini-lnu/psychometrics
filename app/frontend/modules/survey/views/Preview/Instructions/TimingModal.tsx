import React from 'react'
import {
  Button, Layout, Modal,
} from 'antd'
import { secondsLeftFromNow, secondsToHHMMSS } from '~/utils/time'

const { Content } = Layout
const { I18n } = window

interface Props {
  show: boolean
  assessmentName: string
  campaignExpiryDate: string
  totalAssessmentTime: number
  ok: () => void
  onCancel: () => void
}

export const TimingModal: React.FC<Props> = ({
  show, assessmentName, campaignExpiryDate, totalAssessmentTime, ok, onCancel,
}) => {
  const remainingCampaignTime = secondsLeftFromNow(campaignExpiryDate)
  return (
    <Modal
      open={show}
      footer={(
        <>
          <Button danger onClick={onCancel}>
            {I18n.t('campaign.time_left.cancel')}
          </Button>
          <Button type="primary" onClick={() => ok()}>
            {I18n.t('campaign.time_left.continue')}
          </Button>
        </>
      )}
    >
      <Content>
        {I18n.t('campaign.time_left.notification',
          {
            assessmentName,
            totalAssessmentTime: secondsToHHMMSS(totalAssessmentTime),
            remainingCampaignTime: secondsToHHMMSS(remainingCampaignTime),
          })}
      </Content>
    </Modal>
  )
}
