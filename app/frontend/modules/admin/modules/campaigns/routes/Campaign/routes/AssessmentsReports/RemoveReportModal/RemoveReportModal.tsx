import React, { useState } from 'react'
import { Modal, Checkbox } from 'antd'
import { PropsFromRedux } from './connect'

const { I18n } = window

export interface OwnProps {
  close(): void
  campaignReportId: number
  campaignId: number
}

export type Props = OwnProps & PropsFromRedux

const RemoveReportModal: React.FC<Props> = ({
  close, campaignId, remove, campaignReportId,
}) => {
  const [removeUserReports, setRemoveUserReports] = useState(false)

  const handleRemoveReport = () => {
    remove(campaignId, campaignReportId, removeUserReports)
    close()
  }

  return (
    <Modal
      width={650}
      title={I18n.t('campaign_report.modals.remove.title')}
      visible
      centered
      okText={I18n.t('common.text.continue')}
      onCancel={close}
      onOk={handleRemoveReport}
    >
      <Checkbox checked={removeUserReports} onChange={() => setRemoveUserReports(!removeUserReports)}>
        {I18n.t('campaign_report.modals.remove.apply')}
      </Checkbox>
    </Modal>
  )
}

export default RemoveReportModal
