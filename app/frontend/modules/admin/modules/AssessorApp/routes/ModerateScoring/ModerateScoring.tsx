import { useState } from 'react'
import {
  Menu, Button,
} from 'antd'
import {
  AppstoreOutlined, MailOutlined, SettingOutlined, CloseOutlined,
} from '@ant-design/icons'
import { ScoringTable } from './ScoringTable'
import { Evaluation } from './Evaluation'

import styles from './ModerateScoring.less'
import { Profile } from './Profile'
import { OverallScoring } from './OverallScoring'
import { Reports } from './Reports'
import { AssessorEvaluations } from './AssessorEvaluations'

const items = [
  {
    key: 'profile',
    icon: <MailOutlined />,
  },
  {
    key: 'overallScoring',
    icon: <AppstoreOutlined />,
  },
  {
    key: 'reports',
    icon: <SettingOutlined />,
  },
  {
    key: 'assessorEvaluations',
    icon: <SettingOutlined />,
  },
]

export const ModerateScoring = () => {
  const [tab, setTab] = useState(null)
  const onChange = ({ key }) => {
    setTab(key)
  }

  return (
    <div>
      <div className={styles.header}>
        User Executive Test
      </div>
      <div className={styles.main}>
        <div className={styles.evaluation}>
          <ScoringTable />
          <Evaluation />
        </div>
        {tab && (
          <div className={styles.sidebar}>
            <div className={styles.header}>
              <div>Title</div>
              <Button type="text" onClick={() => setTab(null)}><CloseOutlined /></Button>
            </div>
            {tab === 'profile' && <Profile />}
            {tab === 'overallScoring' && <OverallScoring />}
            {tab === 'reports' && <Reports />}
            {tab === 'assessorEvaluations' && <AssessorEvaluations />}
          </div>
        )}
        <div className={styles.menu}>
          <Menu onSelect={onChange} mode="inline" items={items} />
        </div>
      </div>
    </div>
  )
}
