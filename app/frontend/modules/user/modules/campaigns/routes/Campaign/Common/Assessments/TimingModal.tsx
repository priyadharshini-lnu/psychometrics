import React from 'react'
import {
  Button, Modal,
} from 'antd'
import './styles.scss'
import { minutesLeft } from 'utils/time'

const { I18n } = window

interface Props {
  show: boolean
  ok(): void
  close(): void
  assessmentName: string
  assessmentTime: number
  timer: {
    fixedTime: boolean
    campaignDuration: number
    startedAt: string
  }
}

const TimingModal: React.FC<Props> = ({
  ok, show, close, assessmentName, assessmentTime, timer: { startedAt, campaignDuration },
}) => {
  const delta = minutesLeft(new Date(startedAt), campaignDuration)

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
          <Button danger onClick={() => close()}>
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
