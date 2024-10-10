import { FC, useState } from 'react'
import { Button, Tabs, Space } from 'antd'
import { CloseOutlined } from '@ant-design/icons'
import { connect, ConnectedProps } from 'react-redux'
import cs from 'classnames'
import ScoringTable from './ScoringTable'
import Evaluation from './Evaluation'
import styles from './ModerateScoring.less'
import { Profile } from './Profile'
import { OverallScoring } from './OverallScoring'
import { Reports } from './Reports'
import { AssessorEvaluations } from './AssessorEvaluations'
import { AssessorEvaluationsIcon } from './icons/AssessorEvaluations'
import { OverallScoresIcon } from './icons/OverallScores'
import { ProfileIcon } from './icons/Profile'
import { ReportsIcon } from './icons/Reports'
import { getLeadAssessorResult } from '../../core/scoreModerate'
import { RootState } from '~/modules/admin/core/rootReducers'

const items = [
  {
    key: 'profile',
    icon: <ProfileIcon />,
  },
  {
    key: 'overallScoring',
    icon: <OverallScoresIcon />,
  },
  {
    key: 'reports',
    icon: <ReportsIcon />,
  },
  {
    key: 'assessorEvaluations',
    icon: <AssessorEvaluationsIcon />,
  },
]

const connecter = connect((state: RootState) => ({
  assessorResult: getLeadAssessorResult(state.assessors.scoreModerate),
}), {
})

interface Props extends ConnectedProps<typeof connecter> {}

export const ModerateScoringComponent: FC<Props> = ({ assessorResult }) => {
  const [tab, setTab] = useState<string>()
  const [refreshTab, setRefreshTab] = useState(false)

  const onChange = (key) => {
    setTab(key)
  }

  const handleCloseTab = () => {
    setTab('')
  }

  const handleSave = () => {
    setRefreshTab(prev => !prev)
  }

  const tabHeader = (title, withoutBorder = false) => tab && (
    <div className={cs(styles.tabheader, { [styles.withoutBorder]: withoutBorder })}>
      <div>{title}</div>
      <Button type="text" onClick={handleCloseTab}><CloseOutlined /></Button>
    </div>
  )

  return (
    <div>
      <div className={styles.header}>
        {assessorResult && (
          <Space>
            <Space>
              {assessorResult.subject.first_name}
              {assessorResult.subject.last_name}
            </Space>
            <span className={styles.email}>{assessorResult.subject.email}</span>
          </Space>
        )}
      </div>
      <div className={styles.main}>
        <div className={styles.evaluation}>
          <ScoringTable onSave={handleSave} />
          <Evaluation />
        </div>
        {tab && (
          <>
            {tab === 'profile' && <Profile header={tabHeader} onClose={handleCloseTab} />}
            {tab === 'overallScoring' && <OverallScoring header={tabHeader} refresh={refreshTab} />}
            {tab === 'reports' && <Reports header={tabHeader} />}
            {tab === 'assessorEvaluations' && <AssessorEvaluations header={tabHeader} />}
          </>
        )}
        <div className={cs(styles.menu, { [styles.inactiveTab]: tab === undefined })}>
          <Tabs
            onChange={onChange}
            onTabClick={onChange}
            tabPosition="right"
            activeKey={tab}
            items={items.map(({ icon, key }) => ({
              label: icon,
              key,
              children: null,
            }))}
          />
        </div>
      </div>
    </div>
  )
}

export const ModerateScoring = connecter(ModerateScoringComponent)
