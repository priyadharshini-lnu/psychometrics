import React, { useState } from 'react'
import { Modal, Checkbox } from 'antd'
import { PropsFromRedux } from './connect'

const { I18n } = window

export interface OwnProps {
  close(): void
  campaignReportId: number
  campaignId: number
  userAccess: boolean
}

export type Props = OwnProps & PropsFromRedux

const ToggleUserAccessModal: React.FC<Props> = ({
  close, campaignId, toggleUserAccess, campaignReportId, userAccess,
}) => {
  const [userReportsUserAccess, setUserReportsUserAccess] = useState(false)

  const handleToggleUserAccess = () => {
    toggleUserAccess(campaignId, campaignReportId, userReportsUserAccess)
    close()
  }

  const modalTitle = () => (
    userAccess ? I18n.t('campaign_report.modals.user_access.title.disable')
      : I18n.t('campaign_report.modals.user_access.title.enable')
  )

  return (
    <Modal
      width={650}
      title={modalTitle()}
      open
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
