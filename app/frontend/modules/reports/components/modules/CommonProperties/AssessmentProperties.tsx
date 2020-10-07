import React from 'react'
import Select from 'react-select'
import AppStore from 'modules/reports/store/AppStore'
import { getValue } from 'modules/reports/presenters/ReactSelectPresenter'
import styles from 'modules/reports/views/PropertyPanel/components/PropertyPanel.scss'

interface Props {
  assessmentId: number
  changeAssessment: (assessmentId: number) => void
}

const AssessmentProperties: React.FC<Props> = ({ assessmentId, changeAssessment }) => {
  const selectOptions = AppStore.assessments.map(a => ({ label: a.name, value: a.id }))
  return (
    <div>
      <div className="form-group">
        <span className={styles.label}>Assessment</span>
        <Select
          options={selectOptions}
          value={getValue(selectOptions, assessmentId)}
          onChange={a => changeAssessment(a.value)}
        />
      </div>
    </div>
  )
}

export default AssessmentProperties
