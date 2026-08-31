import { useState } from 'react'
import {
  Modal, Button, Select, message,
  Space,
} from 'antd'
import _ from 'lodash'
import styles from './RemapAssessment.less'

const { I18n } = window

const RemapAssessment = ({
  reportId, assessments, close, remapAssessment,
}) => {
  const [assessmentId, setAssessmentId] = useState()
  const [newAssessmentId, setNewAssessmentId] = useState()

  const save = () => {
    if (assessmentId && newAssessmentId) {
      remapAssessment(reportId, assessmentId, newAssessmentId).then(() => {
        message.config({ top: 50 })
        message.success(I18n.t('administration.reports.modals.remap_assessment.success_message'), 20)
        close()
      })
    }
  }
  const options = _.map(assessments, a => ({ label: a.name, value: a.id }))

  return (
    <Modal
      open
      title="Remap Assessment"
      onCancel={close}
      mask={{ closable: false }}
      footer={(
        <div>
          <Button type="primary" onClick={save}>{I18n.t('common.actions.save')}</Button>
          <Button onClick={close}>{I18n.t('common.actions.close')}</Button>
        </div>
        )}
    >
      <div className={styles.body}>
        <Space orientation="vertical" className={styles.content}>
          <div className={styles.input}>
            <label>{I18n.t('administration.reports.modals.remap_assessment.old_assessment_name')}</label>
            <Select className="w-100" options={options} value={assessmentId} onChange={setAssessmentId} />
          </div>
          <div className={styles.input}>
            <label>{I18n.t('administration.reports.modals.remap_assessment.new_assessment_name')}</label>
            <Select className="w-100" options={options} value={newAssessmentId} onChange={setNewAssessmentId} />
          </div>
        </Space>
      </div>
    </Modal>
  )
}

export default RemapAssessment
