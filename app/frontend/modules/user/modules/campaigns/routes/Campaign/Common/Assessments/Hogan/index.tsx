import React, { useState, useCallback } from 'react'
import {
  Row, Col, Card, Progress, Input, Tag,
} from 'antd'
import { ClockCircleOutlined } from '@ant-design/icons'
import '../styles.scss'
import { UserAssessment } from 'modules/user/modules/campaigns/core/userAssessment/interfaces'
import { History } from 'history'
import PrivacyModal from '../PrivacyModal'
import AssessmentCard from '../AssessmentCard'
import AssessmentActionBtn from './AssessmentActionBtn'

const { I18n } = window

interface HoganData {
  url: string
  userId: string
  password: string
  uniqueId: string
  firstName: string
  lastName: string
  directAssessmentId: string
  displayInformedConsent: string
  returnUrl: string
  languageId: string
}

interface Props {
  userAssessment: UserAssessment
  acceptPolicy(): Promise<unknown>
  history: History
  size: number
  withSidebar: boolean
  disabled: boolean
  disabledReason: string
  loginHogan(url: string): Promise<{ response: HoganData }>
}

const Hogan: React.FC<Props> = ({
  userAssessment, acceptPolicy, loginHogan, size, disabled, disabledReason, withSidebar,
}) => {
  const [hoganData, setHoganData] = useState<HoganData| null>(null)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)

  const onLoginHogan = () => {
    setLoading(true)
    loginHogan(userAssessment.hoganUrl).then((data) => {
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
    <AssessmentCard size={size} withSidebar={withSidebar}>
      <Card
        bodyStyle={{ padding: 0 }}
        hoverable
        cover={(
          <div className="internal-cover">
            <div className="internal-caption">
              <div className="internal-icon hogan">
                <span className="icon-hogan" />
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
            <Row className="info-line">
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
                strokeColor={userAssessment.status === 'completed' ? '#4eada7' : '#aaa'}
              />
            </div>
            <div className="button">
              <AssessmentActionBtn
                userAssessment={userAssessment}
                setShowConfirm={setShowConfirm}
                loading={loading}
                loginHogan={onLoginHogan}
                disabled={disabled}
                disabledReason={disabledReason}
              />
            </div>
          </div>
        </div>
      </Card>
      {userAssessment.needConfirm
        && <PrivacyModal accept={accept} show={showConfirm} close={() => setShowConfirm(false)} />}
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

export default Hogan
