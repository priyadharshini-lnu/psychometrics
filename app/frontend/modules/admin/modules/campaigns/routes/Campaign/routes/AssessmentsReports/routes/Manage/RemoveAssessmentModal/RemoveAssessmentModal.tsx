import React, { useState } from 'react'
import {
  Modal, Checkbox, message, Typography,
} from 'antd'
import Assessment from '~/modules/admin/modules/campaigns/interfaces/Assessment'
import { SafeHTML } from '~/components/SafeHTML'
import { isSuperAdmin } from '~/core/currentUser'
import { PropsFromRedux } from './connect'

const { I18n } = window
const { Text, Paragraph } = Typography

export interface OwnProps {
  close(): void
  assessment: Assessment
  campaignId: number
  campaignAssessmentId: number
}

export type Props = OwnProps & PropsFromRedux

const RemoveAssessmentModal: React.FC<Props> = ({
  close, campaignId, remove, assessment, campaignAssessmentId, currentUser,
}) => {
  const [removeUserAssessments, setRemoveUserAssessments] = useState(false)

  const { name } = assessment

  const handleRemoveAssessment = () => {
    remove(campaignId, campaignAssessmentId, { removeUserAssessments })
    message.success(I18n.t('campaign_assessment.modals.remove.successfully', { name }))
    close()
  }

  return (
    <Modal
      width={650}
      title={I18n.t('campaign_assessment.modals.remove.title')}
      open
      centered
      okText={I18n.t('common.text.continue')}
      onCancel={close}
      onOk={handleRemoveAssessment}
    >
      <Paragraph>
        <SafeHTML html={I18n.t('campaign_assessment.modals.remove.msg_text', { name })} />
      </Paragraph>
      {isSuperAdmin(currentUser) && (
        <Checkbox checked={removeUserAssessments} onChange={() => setRemoveUserAssessments(!removeUserAssessments)}>
          {I18n.t('campaign_report.modals.remove.apply')}
          <br />
          <Text type="danger">{I18n.t('campaign_assessment.modals.remove.helper_text')}</Text>
        </Checkbox>
      )}
    </Modal>
  )
}

export default RemoveAssessmentModal
