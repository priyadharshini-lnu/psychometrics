/* eslint-disable react/jsx-no-target-blank */
/* eslint-disable max-len */
import React, { useState, useCallback } from 'react'
import {
  Row, Col, Card, Progress, Dropdown, Menu, Input,
} from 'antd'
import {
  DownloadOutlined, LoadingOutlined, ClockCircleOutlined, CheckOutlined, PlayCircleOutlined,
} from '@ant-design/icons'
import './styles.scss'
import ContinueIcon from './ContinueIcon'
import PrivacyModal from './PrivacyModal'

const IN_PROGRESS = 'in_progress'

const DownloadLink = ({ report, text }) => {
  const reportUrl = report.externalReportUrl || report.pdfUrl
  if (reportUrl) {
    return (
      <a href={reportUrl} onClick={e => e.stopPropagation()} target="_blank" disabled={report.generating}>
        <DownloadOutlined />
        {' '}
        {text}
      </a>
    )
  }
  return (
    <a disabled>
      <DownloadOutlined />
      {I18n.t('threesixty.processing_report')}
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
      <a href="#" onClick={showPolicyConfirm}>
        {loading ? <LoadingOutlined /> : <ContinueIcon />}
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
          <div className="dropdown">
            <DownloadOutlined />
            {' '}
            {I18n.t('threesixty.download_reports')}
          </div>
        </Dropdown>
      )
    } if (assignedReports.length === 1) {
      const report = assignedReports[0]
      return <DownloadLink report={report} text={report.generating ? I18n.t('threesixty.processing_report') : I18n.t('threesixty.download_report')} />
    }
    return (
      <a>
        <CheckOutlined />
        {' '}
        {I18n.t('threesixty.completed')}
      </a>
    )
  }
  return (
    <a href="#" onClick={showPolicyConfirm}>
      {loading ? <LoadingOutlined /> : <PlayCircleOutlined />}
      {' '}
      {I18n.t('threesixty.begin')}
    </a>
  )
}

export default function Hogan ({ campaign: assign, acceptPolicy, loginHogan }) {
  const [hoganData, setHoganData] = useState(null)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)

  const onLoginHogan = () => {
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


  const accept = () => {
    setShowConfirm(false)
    setLoading(true)

    acceptPolicy().then(() => {
      onLoginHogan()
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
                <span className="icon-hogan" />
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
