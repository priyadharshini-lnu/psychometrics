import React, { useState } from 'react'
import { Modal, Checkbox, message } from 'antd'
import _ from 'lodash'
import Assessment from 'modules/admin/modules/campaigns/interfaces/Assessment'
import Report from 'modules/admin/modules/campaigns/interfaces/Report'
import { PropsFromRedux } from './connect'

const { I18n } = window

export interface OwnProps {
  close(): void
  assessment: Assessment
  campaignId: number
  campaignAssessmentId: number
  reports: Report[]
}

export type Props = OwnProps & PropsFromRedux

const RemoveAssessmentModal: React.FC<Props> = ({
  close, campaignId, remove, assessment, reports, campaignAssessmentId,
}) => {
  const [removeUserAssessments, setRemoveUserAssessments] = useState(false)

  const { name, reportIds } = assessment

  const reportNames = () => {
    const names = reports.map(report => (reportIds.includes(report.reportId) ? report.name : ''))
    return _.compact(names)
  }

  const handleRemoveAssessment = () => {
    remove(campaignId, campaignAssessmentId, { reportIds, removeUserAssessments })
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
      <p>
        {I18n.t('campaign_assessment.modals.remove.content')}
        :
      </p>
      <ul>
        {reportNames().map(name => (
          <li key={name}>
            {name}
          </li>
        ))}
      </ul>
      <hr />
      <Checkbox checked={removeUserAssessments} onChange={() => setRemoveUserAssessments(!removeUserAssessments)}>
        {I18n.t('campaign_report.modals.remove.apply')}
      </Checkbox>
    </Modal>
  )
}

export default RemoveAssessmentModal
