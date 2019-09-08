/* eslint-disable react/jsx-no-target-blank */
/* eslint-disable max-len */
import React, { useState, useCallback } from 'react'
import {
  Row, Col, Icon, Card, Progress, Dropdown, Menu, Input,
} from 'antd'
import './styles.scss'
import hogan from './hogan.png'
import ContinueIcon from './ContinueIcon'
import AssessmentIcon from './AssessmentIcon'
import PrivacyModal from './PrivacyModal'

const IN_PROGRESS = 'in_progress'

const openReport = (e, report) => {
  e.stopPropagation()
  window.open(report.externalReportUrl, 'windowMindmill', 'width=980,height=700')
  return null
}

const DownloadLink = ({ report, showName }) => {
  if (report.hasExternalReport && report.externalReportUrl) {
    return (
      <a onClick={e => openReport(e, report)} href={`${report.externalReportUrl}`}>
        <Icon type="download" />
        {' '}
        {showName ? report.name : I18n.t('threesixty.download_report')}
      </a>
    )
  }
  return (
    <a href={`${report.resultsHoganUrl}`} onClick={e => e.stopPropagation()}>
      <Icon type="download" />
      {' '}
      {I18n.t('threesixty.load_results')}
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
  status, assignedReports, needConfirm,
}, setShowConfirm, loading, loginHogan) => {

  const showPolicyConfirm = (e) => {
    e.preventDefault()
    if (needConfirm) {
      setShowConfirm(true)
    } else {
      loginHogan()
    }
  }

  if (status === IN_PROGRESS) {
    return (
      <a href="#" onClick={loginHogan}>
        {loading ? <Icon type="loading" /> : <ContinueIcon />}
        {' '}
        {I18n.t('threesixty.continue')}
      </a>
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
            {I18n.t('threesixty.download_reports')}
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
    <a href="#" onClick={showPolicyConfirm}>
      {loading ? <Icon type="loading" /> : <Icon type="play-circle" />}
      {' '}
      {I18n.t('threesixty.begin')}
    </a>
  )
}

export default function Hogan ({ campaign: assign, loginHogan }) {
  const [hoganData, setHoganData] = useState(null)
  const [loading, setLoading] = useState(false)

  const onLoginHogan = (e) => {
    e.preventDefault()
    setLoading(true)
    loginHogan(assign.hoganUrl).then((data) => {
      setHoganData(data.response)
    })
  }

  const formRef = useCallback((form) => {
    if (hoganData && form !== null) {
      form.submit()
    }
  }, [hoganData])


  const accept = (e) => {
    acceptPolicy().then(() => {
      onLoginHogan(e)

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
            <img className="service" src={hogan} alt="" />
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
              {renderButtonContent(assign, setShowConfirm, loading, onLoginHogan)}
            </div>
          </div>
        </div>
      </Card>
      {assign.needConfirm && <PrivacyModal accept={accept} show={showConfirm} close={() => setShowConfirm(false)} />}
      {hoganData && (
        <form action={hoganData.url} method="post" ref={formRef} style={{ display: 'none' }}>
          <Input type="hidden" name="UserID" value={hoganData.userId} />
          <Input type="hidden" name="Password" value={hoganData.password} />
          <Input type="hidden" name="UniqueID" value={hoganData.uniqueId} />
          <Input type="hidden" name="FirstName" value={hoganData.firstName} />
          <Input type="hidden" name="LastName" value={hoganData.lastName} />
          <Input type="hidden" name="LanguageID" value={hoganData.languageId} />
          <Input type="hidden" name="DirectAssessmentID" value={hoganData.directAssessmentId} />
          <Input type="hidden" name="DisplayInformedConsent" value={hoganData.displayInformedConsent} />
          <Input type="hidden" name="ReturnURL" value={hoganData.returnUrl} />
        </form>
      )}
    </Col>
  )
}
