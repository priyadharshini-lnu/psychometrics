/* eslint-disable react/jsx-no-target-blank */
/* eslint-disable max-len */
import React, { useState } from 'react'
import {
  Row, Col, Icon, Card, Progress, Dropdown, Menu,
} from 'antd'
import { Link } from 'react-router-dom'
import './styles.scss'
import PrivacyModal from './PrivacyModal'
import mindmill from './mindmill.png'
import ContinueIcon from './ContinueIcon'
import AssessmentIcon from './AssessmentIcon'

const IN_PROGRESS = 'in_progress'

const DownloadLink = ({ report, text }) => {
  const { mindmill, mindmillReportUrl, pdfUrl } = report

  return (
    <a href={mindmill ? mindmillReportUrl : pdfUrl} onClick={e => e.stopPropagation()} target="_blank" disabled={report.generating}>
      <Icon type="download" />
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
  mindmill, mindmillUrl, url, status, assignedReports, needConfirm,
}, setShowConfirm, loading, loadAssessment) => {
  let href = url
  if (mindmill) { href = mindmillUrl }

  const showPolicyConfirm = (e) => {
    e.preventDefault()
    if (needConfirm) {
      setShowConfirm(true)
    } else {
      loadAssessment(href)
    }
  }

  const LinkTag = ({ children }) => (mindmill
    ? <a href={href} onClick={showPolicyConfirm}>{children}</a>
    : <Link to={href} onClick={showPolicyConfirm}>{children}</Link>)

  if (status === IN_PROGRESS) {
    return (
      <LinkTag>
        {loading ? <Icon type="loading" /> : <ContinueIcon />}
        {' '}
        {I18n.t('threesixty.continue')}
      </LinkTag>
    )
  }

  if (status === 'completed') {
    if (assignedReports.length > 1) {
      return (
        <Dropdown
          trigger={['click']}
          overlay={() => ReportsMenu(assignedReports)}
        >
          <div className="dropdown">
            <Icon type="download" />
            {' '}
            {I18n.t('threesixty.download_report')}
          </div>
        </Dropdown>
      )
    } if (assignedReports.length === 1) {
      const report = assignedReports[0]
      return <DownloadLink report={report} text={report.generating ? I18n.t('threesixty.processing_report') : I18n.t('threesixty.download_report')} />
    }
    return (
      <a>
        <Icon type="check" />
        {' '}
        {I18n.t('threesixty.completed')}
      </a>
    )
  }
  return (
    <a href={href} onClick={showPolicyConfirm}>
      {loading ? <Icon type="loading" /> : <Icon type="play-circle" />}
      {' '}
      {I18n.t('threesixty.begin')}
    </a>
  )
}

export default function SingleAssign ({ campaign: assign, acceptPolicy }) {
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)

  const loadAssessment = (href) => {
    setLoading(true)
    location.href = href
  }

  const accept = () => {
    setShowConfirm(false)
    setLoading(true)

    acceptPolicy().then(() => {
      const { url, mindmill, mindmillUrl } = assign
      let href = url

      if (mindmill) { href = mindmillUrl }

      loadAssessment(href)
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
                <AssessmentIcon />
              </div>
              <div className="title">{I18n.t('threesixty.assessment')}</div>
            </div>
            {assign.mindmill && <img className="service" src={mindmill} alt="" />}
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
                <Icon type="clock-circle" />
                {' '}
                {assign.timing}
              </Col>
            </Row>
            <div className="divider" />
            <div className="button">
              {renderButtonContent(assign, setShowConfirm, loading, loadAssessment)}
            </div>
          </div>
        </div>
      </Card>
      {assign.needConfirm && <PrivacyModal accept={accept} show={showConfirm} close={() => setShowConfirm(false)} />}
    </Col>
  )
}
