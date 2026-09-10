import { FC, useState } from 'react'
import { Button, Tabs, Space } from 'antd'
import { connect, ConnectedProps } from 'react-redux'
import { useParams } from 'react-router-dom'
import cs from 'classnames'
import { CloseOutlined, VideoCameraOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import ScoringTable from './ScoringTable'
import Evaluation from './Evaluation'
import styles from './ModerateScoring.less'
import { Profile } from './Profile'
import { OverallScoring } from './OverallScoring'
import { Reports } from './Reports'
import { AssessorEvaluations } from './AssessorEvaluations'
import {
  AssessorEvaluationsIcon, OverallScoresIcon, ProfileIcon, ReportsIcon,
} from '~/glint/icons'
import { getLeadAssessorResult } from '../../core/scoreModerate'
import { RootState } from '~/modules/admin/core/rootReducers'
import { Recordings } from './Recordings'

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
  {
    key: 'recordings',
    icon: <VideoCameraOutlined style={{ fontSize: 25 }} />,
  },
]

const connecter = connect((state: RootState) => ({
  loadedUserId: state.assessors.scoreModerate.userId,
  assessorResult: getLeadAssessorResult(state.assessors.scoreModerate),
  canModerateScore: state.assessors.scoreModerate.canModerateScore,
}), {
})

interface Props extends ConnectedProps<typeof connecter> {}

export const ModerateScoringComponent: FC<Props> = ({ loadedUserId, assessorResult, canModerateScore }) => {
  const { userId } = useParams<{ userId?: string }>()
  const showsLoadedUser = loadedUserId === Number(userId)
  const readOnly = !(canModerateScore && showsLoadedUser)
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
        {assessorResult && showsLoadedUser && (
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
          <ScoringTable onSave={handleSave} readOnly={readOnly} showsLoadedUser={showsLoadedUser} />
          <Evaluation readOnly={readOnly} />
        </div>
        {tab && (
          <>
            {tab === 'profile' && <Profile header={tabHeader} onClose={handleCloseTab} />}
            {tab === 'overallScoring' && <OverallScoring header={tabHeader} refresh={refreshTab} />}
            {tab === 'reports' && <Reports header={tabHeader} />}
            {tab === 'assessorEvaluations' && <AssessorEvaluations header={tabHeader} />}
            {tab === 'recordings' && <Recordings header={tabHeader} />}
          </>
        )}
        <div className={cs(styles.menu, { [styles.inactiveTab]: tab === undefined })}>
          <Tabs
            onChange={onChange}
            onTabClick={onChange}
            tabPlacement="end"
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
