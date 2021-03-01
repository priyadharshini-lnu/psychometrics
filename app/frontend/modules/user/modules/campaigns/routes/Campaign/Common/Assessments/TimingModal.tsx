import React from 'react'
import {
  Button, Modal,
} from 'antd'
import './styles.scss'
import { secondsLeftFromNow, secondsToHHMMSS } from 'utils/time'

const { I18n } = window

interface Props {
  show: boolean
  ok(): void
  close(): void
  assessmentName: string
  totalAssessmentTime: number
  campaignExpiryDate: string
}

const TimingModal: React.FC<Props> = ({
  ok, show, close, assessmentName, totalAssessmentTime, campaignExpiryDate,
}) => {
  const remainingCampaignTime = secondsLeftFromNow(campaignExpiryDate)

  return (
    <Modal
      title={(
        <div className="help-modal-header">
          {I18n.t('campaign.time_left.title')}
        </div>
      )}
      visible={show}
      onCancel={close}
      footer={(
        <div>
          <Button type="primary" onClick={() => ok()}>
            {I18n.t('campaign.time_left.continue')}
          </Button>
          <Button type="danger" onClick={() => close()}>
            {I18n.t('campaign.time_left.cancel')}
          </Button>
        </div>
      )}
    >
      <div className="help-modal-body">
        {I18n.t('campaign.time_left.notification',
          {
            assessmentName,
            totalAssessmentTime: secondsToHHMMSS(totalAssessmentTime),
            remainingCampaignTime: secondsToHHMMSS(remainingCampaignTime),
          })}
      </div>
    </Modal>
  )
}

export default TimingModal
