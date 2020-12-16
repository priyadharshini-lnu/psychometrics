import React from 'react'
import {
  Button, Modal,
} from 'antd'
import './styles.scss'
import { minutesLeftFromNow } from 'utils/time'

const { I18n } = window

interface Props {
  show: boolean
  ok(): void
  close(): void
  assessmentName: string
  assessmentTime: string
  timer: {
    fixedTime: boolean
    campaignDuration: number
    startedAt: string
    additionalTime: number
    expiryDate: string
  }
}

const TimingModal: React.FC<Props> = ({
  ok, show, close, assessmentName, assessmentTime, timer: { expiryDate },
}) => {
  const delta = minutesLeftFromNow(new Date(expiryDate))

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
        {I18n.t('campaign.time_left.notification', { assessmentName, x: assessmentTime, y: delta })}
      </div>
    </Modal>
  )
}

export default TimingModal
