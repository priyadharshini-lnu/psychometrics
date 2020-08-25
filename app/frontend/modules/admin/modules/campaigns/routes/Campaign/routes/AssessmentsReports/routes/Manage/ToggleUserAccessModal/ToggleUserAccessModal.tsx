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

const ToggleUserAccessModal: React.FC<Props> = ({
  close, campaignId, toggleUserAccess, campaignReportId,
}) => {
  const [userReportsUserAccess, setUserReportsUserAccess] = useState(false)

  const handleToggleUserAccess = () => {
    toggleUserAccess(campaignId, campaignReportId, userReportsUserAccess)
    close()
  }

  return (
    <Modal
      width={650}
      title={I18n.t('campaign_report.modals.user_access.title')}
      visible
      centered
      okText={I18n.t('common.text.continue')}
      onCancel={close}
      onOk={handleToggleUserAccess}
    >
      <Checkbox
        checked={userReportsUserAccess}
        onChange={() => setUserReportsUserAccess(!userReportsUserAccess)}
      >
        {I18n.t('campaign_report.modals.user_access.apply')}
      </Checkbox>
    </Modal>
  )
}

export default ToggleUserAccessModal
