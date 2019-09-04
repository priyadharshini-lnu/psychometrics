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

const openReport = (e, report) => {
  e.stopPropagation()
  window.open(report.mindmillReportUrl, 'windowMindmill', 'width=980,height=700')
  return false
}

const DownloadLink = ({ report, showName }) => {
  if (report.mindmill) {
    return (
      <a href={`${report.mindmillReportUrl}`} onClick={e => openReport(e, report)}>
        <Icon type="download" />
        {' '}
        {showName ? report.name : I18n.t('threesixty.download_report')}
      </a>
    )
  }
  return (
    <a href={`${report.pdfUrl}.pdf`} onClick={e => e.stopPropagation()} target="_blank">
      <Icon type="download" />
      {' '}
      {showName ? report.name : I18n.t('threesixty.download_report') }
    </a>
  )
}

const ReportsMenu = reports => (
  <Menu>
    {reports.map(report => (
      <Menu.Item key={report.id}>
        <DownloadLink report={report} showName />
      </Menu.Item>
    ))}
  </Menu>
)

const renderButtonContent = ({
  mindmill, mindmillUrl, url, status, assignedReports, needConfirm,
}, setShowConfirm) => {
  let href = url
  if (mindmill) { href = mindmillUrl }

  const showPolicyConfirm = (e) => {
    e.preventDefault()
    if (needConfirm) {
      setShowConfirm(true)
    } else {
      location.href = href
    }
  }

  const LinkTag = ({ children }) => (mindmill
    ? <a href={href} onClick={showPolicyConfirm}>{children}</a>
    : <Link to={href} onClick={showPolicyConfirm}>{children}</Link>)

  if (status === IN_PROGRESS) {
    return (
      <LinkTag>
        <ContinueIcon />
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
          <div>
            <Icon type="download" />
            {' '}
            {I18n.t('threesixty.download_report')}
          </div>
        </Dropdown>
      )
    } if (assignedReports.length === 1) {
      const report = assignedReports[0]
      return <DownloadLink report={report} />
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
      <Icon type="play-circle" />
      {' '}
      {I18n.t('threesixty.begin')}
    </a>
  )
}

export default function SingleAssign ({ campaign: assign, acceptPolicy }) {
  const [showConfirm, setShowConfirm] = useState(false)
  const accept = () => {
    acceptPolicy().then(() => {
      location.href = assign.url
    })
  }
  return (
    <Col className="card" xs={24} sm={12} md={8} lg={6} xl={4}>
      <Link to={assign.status !== 'completed' ? assign.url : '#'}>
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
                <Col className="info-block">
                  <Icon type="question-circle" />
                  {' '}
                  {assign.questionsCount}
                </Col>
              </Row>
              <div className="divider" />
              <div className="button">
                {renderButtonContent(assign, setShowConfirm)}
              </div>
            </div>
          </div>
        </Card>
      </Link>
      {assign.needConfirm && <PrivacyModal accept={accept} show={showConfirm} close={() => setShowConfirm(false)} />}
    </Col>
  )
}
