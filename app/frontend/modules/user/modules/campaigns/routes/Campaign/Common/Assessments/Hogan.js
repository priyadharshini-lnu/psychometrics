/* eslint-disable react/jsx-no-target-blank */
/* eslint-disable max-len */
import React, { useState, useCallback } from 'react'
import {
  Row, Col, Card, Progress, Input, Tag, Tooltip,
} from 'antd'
import {
  LoadingOutlined, ClockCircleOutlined, CheckOutlined, PlayCircleOutlined,
} from '@ant-design/icons'
import './styles.scss'
import ContinueIcon from './ContinueIcon'
import PrivacyModal from './PrivacyModal'
import AssessmentCard from './AssessmentCard'

const IN_PROGRESS = 'in_progress'

const renderButtonContent = ({
  status, needConfirm,
}, setShowConfirm, loading, loginHogan, disabled) => {
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
    return (
      <a>
        <CheckOutlined />
        {' '}
        {I18n.t('threesixty.completed')}
      </a>
    )
  }
  return disabled ? (
    <Tooltip placement="topRight" title={I18n.t('campaign.complete_prev')}>
      <a href="#" className="disabled">
        {loading ? <LoadingOutlined /> : <PlayCircleOutlined />}
        {' '}
        {I18n.t('threesixty.begin')}
      </a>
    </Tooltip>
  ) : (
    <a href="#" onClick={showPolicyConfirm}>
      {loading ? <LoadingOutlined /> : <PlayCircleOutlined />}
      {' '}
      {I18n.t('threesixty.begin')}
    </a>
  )
}

export default function Hogan ({
  userAssessment: assign, acceptPolicy, loginHogan, size, disabled,
}) {
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
    <AssessmentCard size={size}>
      <Card
        bodyStyle={{ padding: 0 }}
        hoverable
        cover={(
          <div className="internal-cover">
            <div className="internal-caption">
              <div className="internal-icon hogan">
                <span className="icon-hogan" />
              </div>
              {assign.status !== 'completed' && (
                <div>
                  <Tag
                    color={assign.status === 'not_started' ? 'green' : 'blue'}
                    style={{ background: 'transparent' }}
                  >
                    {I18n.t(`campaign.${assign.status}`)}
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
              {assign.assessmentName}
            </div>
            <Row type="flex" className="info-line">
              <Col className="info-block">
                <ClockCircleOutlined />
                {' '}
                {assign.timing}
              </Col>
            </Row>
            <div className="card-progress">
              <Progress
                percent={assign.completionPercent || 0}
                strokeWidth={5}
                strokeColor="#aaa"
              />
            </div>
            <div className="button">
              {renderButtonContent(assign, setShowConfirm, loading, onLoginHogan, disabled)}
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
    </AssessmentCard>
  )
}
