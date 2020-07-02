/* eslint-disable react/jsx-no-target-blank */
/* eslint-disable max-len */
import React, { useState } from 'react'
import {
  Row, Col, Card, Progress, Dropdown, Menu,
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
  mindmill, mindmillUrl, url, status, assignedReports, needConfirm, assessmentCategory,
}, setShowConfirm, loading, loadAssessmentOrCheckingWizard) => {
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
    if (!assignedReports.length || assessmentCategory === 'agile') {
      return (
        <a>
          <CheckOutlined />
          {' '}
          {I18n.t('threesixty.completed')}
        </a>
      )
    }
    if (assignedReports.length > 1) {
      return (
        <Dropdown
          trigger={['click']}
          overlay={() => ReportsMenu(assignedReports)}
        >
          <div className="dropdown">
            <DownloadOutlined />
            {' '}
            {I18n.t('threesixty.download_report')}
          </div>
        </Dropdown>
      )
    } if (assignedReports.length === 1) {
      const report = assignedReports[0]
      return <DownloadLink report={report} text={report.generating ? I18n.t('threesixty.processing_report') : I18n.t('threesixty.download_report')} />
    }
  }
  return (
    <a href={href} onClick={showPolicyConfirm}>
      {loading ? <LoadingOutlined /> : <PlayCircleOutlined />}
      {' '}
      {I18n.t('threesixty.begin')}
    </a>
  )
}

export default function SingleAssign ({ campaign: assign, acceptPolicy, history }) {
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)

  const loadAssessment = ({ url, mindmill, mindmillUrl }) => {
    const href = mindmill ? mindmillUrl : url
    setLoading(true)
    location.href = href
  }

  const loadAssessmentOrCheckingWizard = () => {
    if (WizardIsRequired.run(assign.assessmentExtra)) return routeUtils.moveTo(history, '', `/system_checks/${assign.assessmentId}/${assign.id}`)
    return loadAssessment(assign)
  }

  const accept = () => {
    setShowConfirm(false)
    setLoading(true)

    acceptPolicy().then(() => {
      loadAssessmentOrCheckingWizard(assign)
    })
  }
  return (
    <Col className="card" xs={24} sm={12} md={8} lg={6} xl={4}>
      <Card
        bodyStyle={{ padding: 0 }}
        hoverable
        cover={(
          <div className="cover">
            <div className="caption">
              <div className="icon">
                <span className={`icon-${ASSESSMENT_CATEGORY_ICONS[assign.assessmentCategory]}`} />
              </div>
            </div>
            <div className="card-progress">
              <Progress
                percent={assign.completionPercent || 0}
              />
            </div>
          </div>
        )}
      >
        <div className="card-body">
          <div className="card-content">
            <div className="card-title">
              {assign.assessmentName}
            </div>
            <Row type="flex" className="info-line">
              <Col className="info-block">
                <ClockCircleOutlined />
                {' '}
                {assign.timing}
              </Col>
            </Row>
            <div className="divider" />
            <div className="button">
              {renderButtonContent(assign, setShowConfirm, loading, loadAssessmentOrCheckingWizard)}
            </div>
          </div>
        </div>
      </Card>
      {assign.needConfirm && <PrivacyModal accept={accept} show={showConfirm} close={() => setShowConfirm(false)} />}
    </Col>
  )
}
