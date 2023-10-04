import React, { useState } from 'react'
import { Modal, Checkbox, Typography } from 'antd'
import { SafeHTML } from '~/components/SafeHTML'
import { isSuperAdmin } from '~/core/currentUser'
import { PropsFromRedux } from './connect'

const { I18n } = window
const { Paragraph } = Typography

export interface OwnProps {
  close(): void
  campaignReportId: number
  campaignId: number
  reportName: string
}

export type Props = OwnProps & PropsFromRedux

const RemoveReportModal: React.FC<Props> = ({
  close, campaignId, remove, campaignReportId, reportName, currentUser,
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
      open
      centered
      okText={I18n.t('common.text.continue')}
      onCancel={close}
      onOk={handleRemoveReport}
    >
      <Paragraph>
        <SafeHTML html={I18n.t('campaign_report.modals.remove.msg_text', { reportName })} />
      </Paragraph>
      {isSuperAdmin(currentUser) && (
        <Checkbox checked={removeUserReports} onChange={() => setRemoveUserReports(!removeUserReports)}>
          {I18n.t('campaign_report.modals.remove.apply')}
        </Checkbox>
      )}
    </Modal>
  )
}

export default RemoveReportModal
