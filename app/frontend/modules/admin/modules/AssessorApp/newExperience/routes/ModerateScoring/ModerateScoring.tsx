import { FC, useMemo, useState } from 'react'
import {
  useGlintToken,
  Button, Tabs, Flex, Typography, Splitter,
} from '@thetalententerprise/glint'
import { connect, ConnectedProps } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import cs from 'classnames'
import {
  CloseOutlined, VideoCameraOutlined,
  LineChartOutlined,
  FileTextOutlined,
  AuditOutlined,
  UserOutlined,
  LeftOutlined,
  RightOutlined,
} from '~/glint/icons/AccessibleIconsAntDesign'
import { RootState } from '~/modules/admin/core/rootReducers'
import { getLeadAssessorResult } from '~/modules/admin/modules/AssessorApp/core/scoreModerate'
import Evaluation from './Evaluation'
import { Reports } from './Reports'
import { AssessorEvaluations } from './AssessorEvaluations'
import { Recordings } from './Recordings'
import { OverallScoring } from './OverallScoring'
import { Profile } from './Profile'
import ScoringTable from './ScoringTable/ScoringTable'
import styles from './ModerateScoring.less'
import { CandidateAvatar } from '../../components/CandidateAvatar'

const { I18n } = window

const connecter = connect((state: RootState) => ({
  assessorResult: getLeadAssessorResult(state.assessors.scoreModerate),
  canModerateScore: state.assessors.scoreModerate.canModerateScore,
}), {})

const drawerItems = [
  { key: 'profile', icon: <UserOutlined /> },
  { key: 'overallScoring', icon: <LineChartOutlined /> },
  { key: 'reports', icon: <FileTextOutlined /> },
  { key: 'assessorEvaluations', icon: <AuditOutlined /> },
  { key: 'recordings', icon: <VideoCameraOutlined /> },
]

interface Props extends ConnectedProps<typeof connecter> {}

export const ModerateScoringComponent: FC<Props> = ({ assessorResult, canModerateScore }) => {
  const navigate = useNavigate()
  const token = useGlintToken()

  const { campaignId, userId } = useParams<{ campaignId?: string; userId?: string }>()
  const [tab, setTab] = useState<string>()
  const [mainTab, setMainTab] = useState<string>('scoring')
  const [refreshTab, setRefreshTab] = useState(false)
  const [rightPanelSize, setRightPanelSize] = useState<number>(500)

  const handleCloseTab = () => setTab(undefined)
  const handleSave = () => setRefreshTab(prev => !prev)

  const tabHeader = (title, withoutBorder = false) => tab && (
    <div
      className={cs('flex items-center justify-between p-3', {
        [styles.tabheader]: true,
        [styles.withoutBorder]: withoutBorder,
      })}
    >
      <Typography.Text strong>{title}</Typography.Text>
      <Button type="text" icon={<CloseOutlined />} onClick={handleCloseTab} />
    </div>
  )

  const mainTabItems = useMemo(() => [
    {
      key: 'scoring',
      label: I18n.t('admin.scoring_scoring'),
      forceRender: true,
      children: <ScoringTable onSave={handleSave} readOnly={!canModerateScore} />,
    },
    {
      key: 'leadAssessorForm',
      label: I18n.t('admin.moderate_scoring_lead_assessor_form'),
      forceRender: true,
      children: <Evaluation readOnly={!canModerateScore} />,
    },
  ], [canModerateScore, handleSave])

  const activePanel = tab && (
    <Flex className={styles.panelContent}>
      {tab === 'profile' && <Profile header={tabHeader} />}
      {tab === 'overallScoring' && <OverallScoring header={tabHeader} refresh={refreshTab} />}
      {tab === 'reports' && <Reports header={tabHeader} />}
      {tab === 'assessorEvaluations' && <AssessorEvaluations header={tabHeader} />}
      {tab === 'recordings' && <Recordings header={tabHeader} />}
    </Flex>
  )

  const splitterDraggerIcon = (
    <span className={styles.splitterDraggerIcon}>
      <LeftOutlined />
      <RightOutlined />
    </span>
  )

  return (
    <Flex vertical style={{ background: token.colorBgLayout }} className={styles.pageRoot}>
      <div className={cs(styles.stickyHeader, 'pt-4')}>
        <Flex align="center" justify="space-between" className="mb-2 ps-6 pe-6">
          {assessorResult && (
            <Flex align="center" gap={12}>
              <CandidateAvatar
                name={`${assessorResult.subject.first_name ?? ''} ${assessorResult.subject.last_name ?? ''}`}
                size={48}
              />
              <Flex align="center" gap={16} wrap="wrap">
                <Typography.Title level={3} className="mb-0">
                  {`${assessorResult.subject.first_name} ${assessorResult.subject.last_name}`}
                </Typography.Title>
                <Typography.Text type="secondary" className="font-normal self-end">
                  {assessorResult.subject.email}
                </Typography.Text>
              </Flex>
            </Flex>
          )}
          <Button
            variant="outlined"
            icon={<CloseOutlined />}
            onClick={() => navigate(`/assessors/evaluation/campaigns/${campaignId}/users/${userId}`)}
          >
            {I18n.t('shared.close')}
          </Button>
        </Flex>
        <Tabs
          className={cs(styles.mainTabs, styles.stickyTabs, 'ps-6 pe-6')}
          activeKey={mainTab}
          onChange={setMainTab}
          items={mainTabItems.map(item => ({ ...item, children: null }))}
        />
      </div>
      <Flex className={styles.bodyArea}>
        <Splitter
          className={cs(styles.contentSplitter, { [styles.splitterCollapsed]: !tab })}
          draggerIcon={tab ? splitterDraggerIcon : null}
          onResize={(sizes) => {
            const nextSize = Number(sizes[1])
            if (nextSize > 0) {
              setRightPanelSize(nextSize)
            }
          }}
        >
          <Splitter.Panel min={100}>
            <div className={styles.evaluation}>
              {mainTabItems.map(item => (
                <div
                  key={item.key}
                  className={cs('min-h-full', 'p-6', { [styles.tabContentHidden]: mainTab !== item.key })}
                >
                  {item.children}
                </div>
              ))}
            </div>
          </Splitter.Panel>
          <Splitter.Panel
            size={tab ? rightPanelSize : 0}
            min={420}
            max={600}
            resizable={!!tab}
            className={styles.rightPanel}
          >
            {activePanel}
          </Splitter.Panel>
        </Splitter>
        <div className={styles.menu}>
          <Tabs
            onChange={setTab}
            onTabClick={setTab}
            tabPlacement="end"
            classNames={{ indicator: !tab ? styles.inactiveTab : undefined }}
            activeKey={tab}
            style={{ height: '100%' }}
            items={drawerItems.map(({ icon, key }) => ({
              label: icon,
              key,
              children: null,
            }))}
          />
        </div>
      </Flex>
    </Flex>
  )
}

export default connecter(ModerateScoringComponent)
