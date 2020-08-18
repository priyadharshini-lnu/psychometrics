import React from 'react'
import {
  Modal,
} from 'antd'
import { PropsFromRedux } from './connect'

const { I18n } = window


export interface OwnProps {
  close(): void
  campaignReportId: number,
  campaignId: string
}

export type Props = OwnProps & PropsFromRedux

const RemoveReportModal: React.FC<Props> = ({
  close, campaignId, remove, campaignReportId,
}) => {
  const handleUpdate = () => {
    remove(campaignId, campaignReportId)
    close()
  }
  return (
    <Modal
      width={650}
      title={I18n.t('campaign_assessment.modals.update_norm.title')}
      visible
      onCancel={close}
      onOk={handleUpdate}
    >
      <p> abc </p>
    </Modal>
  )
}

export default RemoveReportModal
