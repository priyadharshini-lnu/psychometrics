import React from 'react'
import { Assessment as AssessmentInterface } from 'modules/admin/modules/campaigns/core/assessmentGroups/interfaces'
import { MenuOutlined } from '@ant-design/icons'
import styles from './styles.scss'

interface Props {
  assessment: AssessmentInterface
}

const Assessment: React.FC<Props> = ({ assessment }) => (
  <div className={styles.container}>
    <span className={styles.icon}>
      <MenuOutlined />
    </span>
    <span className={styles.id}>{assessment.id}</span>
    <span className={styles.name}>{assessment.name}</span>
  </div>
)

export default Assessment
