import React, { useState } from 'react'
import { Modal, Checkbox, message } from 'antd'
import Assessment from 'modules/admin/modules/campaigns/interfaces/Assessment'
import { PropsFromRedux } from './connect'

const { I18n } = window

export interface OwnProps {
  close(): void
  assessment: Assessment
  campaignId: number
  campaignAssessmentId: number
}

export type Props = OwnProps & PropsFromRedux

const RemoveAssessmentModal: React.FC<Props> = ({
  close, campaignId, remove, assessment, campaignAssessmentId,
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
      title={I18n.t('campaign_assessment.modals.remove.title', { name })}
      visible
      centered
      okText={I18n.t('common.text.continue')}
      onCancel={close}
      onOk={handleRemoveAssessment}
    >
      <Checkbox checked={removeUserAssessments} onChange={() => setRemoveUserAssessments(!removeUserAssessments)}>
        {I18n.t('campaign_report.modals.remove.apply')}
      </Checkbox>
    </Modal>
  )
}

export default RemoveAssessmentModal
