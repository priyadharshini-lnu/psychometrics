/* eslint-disable react/jsx-no-target-blank */
/* eslint-disable max-len */
import React, { useState } from 'react'
import {
  Row, Col, Card, Progress, Dropdown, Menu, Tag, Tooltip,
} from 'antd'
import {
  DownloadOutlined, CheckOutlined, LoadingOutlined, PlayCircleOutlined, ClockCircleOutlined,
} from '@ant-design/icons'
import { Link } from 'react-router-dom'
import routeUtils from 'utils/route'
import WizardIsRequired from 'modules/user/core/WizardIsRequired'
import './styles.scss'
import PrivacyModal from './PrivacyModal'
import ContinueIcon from './ContinueIcon'
import AssessmentCard from './AssessmentCard'

const IN_PROGRESS = 'in_progress'
const INTERRUPTED = 'interrupted'

const ASSESSMENT_CATEGORY_ICONS = {
  psychometric: 'assessment',
  360: '360',
  hogan: 'hogan',
  mindmill: 'mindmill',
  case_study: 'case_study',
  organisational: 'survey',
  agile: 'agile',
}

const DownloadLink = ({ report, text }) => {
  const { mindmill, mindmillReportUrl, pdfUrl } = report

  return (
    <a href={mindmill ? mindmillReportUrl : pdfUrl} onClick={e => e.stopPropagation()} target="_blank" disabled={report.generating}>
      <DownloadOutlined />
      {' '}
      {text}
    </a>
  )
}

const ReportsMenu = reports => (
  <Menu>
    {reports.map(report => (
      <Menu.Item key={report.id}>
        <DownloadLink report={report} text={report.generating ? `${report.name} (${I18n.t('threesixty.processing')}..)` : report.name} />
      </Menu.Item>
    ))}
  </Menu>
)

const renderButtonContent = ({
  mindmill, mindmillUrl, url, status, userReports, needConfirm, assessmentCategory,
}, setShowConfirm, loading, loadAssessmentOrCheckingWizard, disabled) => {
  let href = url
  if (mindmill) { href = mindmillUrl }

  const showPolicyConfirm = (e) => {
    e.preventDefault()
    if (needConfirm) {
      setShowConfirm(true)
    } else {
      loadAssessmentOrCheckingWizard({ mindmill, mindmillUrl, url })
    }
  }

  const LinkTag = ({ children }) => (mindmill
    ? <a href={href} onClick={showPolicyConfirm}>{children}</a>
    : <Link to={href} onClick={showPolicyConfirm}>{children}</Link>)

  if (status === IN_PROGRESS || status === INTERRUPTED) {
    return (
      <LinkTag>
        {loading ? <LoadingOutlined /> : <ContinueIcon />}
        {' '}
        {I18n.t('threesixty.continue')}
      </LinkTag>
    )
  }

  if (status === 'completed') {
    if (!userReports.length || assessmentCategory === 'agile') {
      return (
        <a>
          <CheckOutlined />
          {' '}
          {I18n.t('threesixty.completed')}
        </a>
      )
    }
    if (userReports.length > 1) {
      return (
        <Dropdown
          trigger={['click']}
          overlay={() => ReportsMenu(userReports)}
        >
          <div className="dropdown">
            <DownloadOutlined />
            {' '}
            {I18n.t('threesixty.download_report')}
          </div>
        </Dropdown>
      )
    } if (userReports.length === 1) {
      const report = userReports[0]
      return <DownloadLink report={report} text={report.generating ? I18n.t('threesixty.processing_report') : I18n.t('threesixty.download_report')} />
    }
  }

  return disabled ? (
    <Tooltip placement="topRight" title={I18n.t('campaign.complete_prev')}>
      <a className="disabled">
        {I18n.t('threesixty.begin')}
        {' '}
        {loading ? <LoadingOutlined /> : <PlayCircleOutlined />}
      </a>
    </Tooltip>
  ) : (
    <a href={href} onClick={showPolicyConfirm}>
      {I18n.t('threesixty.begin')}
      {' '}
      {loading ? <LoadingOutlined /> : <PlayCircleOutlined />}
    </a>
  )
}

export default function InternalAssessment ({
  userAssessment, acceptPolicy, history, size, disabled,
}) {
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)

  const loadAssessment = ({
    url, mindmill, mindmillUrl,
  }) => {
    const href = mindmill ? mindmillUrl : url
    setLoading(true)
    location.href = href
  }

  const loadAssessmentOrCheckingWizard = () => {
    if (WizardIsRequired.run(userAssessment.assessmentExtra)) {
      return routeUtils.moveTo(history, '', `/system_checks/${userAssessment.assessmentId}/${userAssessment.id}`)
    }
    return loadAssessment(userAssessment)
  }

  const accept = () => {
    setShowConfirm(false)
    setLoading(true)

    acceptPolicy().then(() => {
      loadAssessmentOrCheckingWizard(userAssessment)
    })
  }

  return (
    <AssessmentCard size={size}>
      <Card
        bodyStyle={{ padding: 0 }}
        hoverable
        cover={(
          <div className="internal-cover">
            <div className="internal-caption">
              <div className="internal-icon">
                <span className={`icon-${ASSESSMENT_CATEGORY_ICONS[userAssessment.assessmentCategory]}`} />
              </div>
              {userAssessment.status !== 'completed' && (
                <div>
                  <Tag
                    color={userAssessment.status === 'not_started' ? 'green' : 'blue'}
                    style={{ background: 'transparent' }}
                  >
                    {I18n.t(`campaign.${userAssessment.status}`)}
                  </Tag>
                </div>
              )}
            </div>
          </div>
        )}
      >
        <div className="card-body">
          <div className="card-content">
            <div className="card-title">
              {userAssessment.assessmentName}
            </div>
            <Row type="flex" className="info-line">
              <Col className="info-block">
                <ClockCircleOutlined />
                {' '}
                {userAssessment.timing}
              </Col>
            </Row>
            <div className="card-progress">
              <Progress
                percent={userAssessment.completionPercent || 0}
                strokeWidth={5}
                strokeColor="#aaa"
              />
            </div>
            <div className="button">
              {renderButtonContent(userAssessment, setShowConfirm, loading, loadAssessmentOrCheckingWizard, disabled)}
            </div>
          </div>
        </div>
      </Card>
      {userAssessment.needConfirm && <PrivacyModal accept={accept} show={showConfirm} close={() => setShowConfirm(false)} />}
    </AssessmentCard>
  )
}
