import React, { useState } from 'react'
import {
  Row, Col, Card, Progress, Dropdown, Menu, Tooltip,
} from 'antd'
import {
  DownloadOutlined, CheckOutlined, LoadingOutlined, PlayCircleOutlined, ClockCircleOutlined, FieldTimeOutlined,
} from '@ant-design/icons'
import { Link } from 'react-router-dom'
import truncate from 'lodash/truncate'

import routeUtils from 'utils/route'
import WizardIsRequired from 'modules/user/core/WizardIsRequired'

import { ASSESSMENT_TITLE_MAX_LENGTH } from 'modules/user/modules/campaigns/common/assessments'

import PrivacyModal from './PrivacyModal'
import ContinueIcon from './ContinueIcon'

import './styles.scss'

const IN_PROGRESS = 'in_progress'
const INTERRUPTED = 'interrupted'
const TIMED_OUT = 'timed_out'

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
    <a
      href={mindmill ? mindmillReportUrl : pdfUrl}
      onClick={e => e.stopPropagation()}
      target="_blank"
      rel="noopener noreferrer"
      disabled={report.generating}
    >
      <DownloadOutlined />
      {' '}
      {text}
    </a>
  )
}

const ReportsMenu = (reports) => {
  const reportMenuItems = reports || []

  return (
    <Menu>
      {reportMenuItems.map(report => (
        <Menu.Item key={report.id}>
          <DownloadLink
            report={report}
            text={report.generating ? `${report.name} (${I18n.t('threesixty.processing')}..)` : report.name}
          />
        </Menu.Item>
      ))}
    </Menu>
  )
}

const renderButtonContent = ({
  mindmill, mindmillUrl, url, status, assignedReports, needConfirm,
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

  if (status === TIMED_OUT) {
    return (
      <div>
        <FieldTimeOutlined />
        {' '}
        {I18n.t('threesixty.timed_out')}
      </div>
    )
  }

  if (status === IN_PROGRESS || status === INTERRUPTED) {
    return (
      <LinkTag>
        {loading ? <LoadingOutlined /> : <ContinueIcon className="rtl-flip" />}
        {' '}
        {I18n.t('threesixty.continue')}
      </LinkTag>
    )
  }

  if (status === 'completed') {
    if (!assignedReports.length) {
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
      return (
        <DownloadLink
          report={report}
          text={report.generating ? I18n.t('threesixty.processing_report') : I18n.t('threesixty.download_report')}
        />
      )
    }
  }
  return (
    <a href={href} onClick={showPolicyConfirm}>
      {loading ? <LoadingOutlined /> : <PlayCircleOutlined className="rtl-flip" />}
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
    if (WizardIsRequired.run(assign.assessmentExtra)) {
      return routeUtils.moveTo(history, '', `/system_checks/${assign.assessmentId}/${assign.id}?type=legacy`)
    }
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
              <Tooltip title={assign.assessmentName} placement="bottom">
                <span>
                  {truncate(assign.assessmentName, { length: ASSESSMENT_TITLE_MAX_LENGTH })}
                </span>
              </Tooltip>
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
