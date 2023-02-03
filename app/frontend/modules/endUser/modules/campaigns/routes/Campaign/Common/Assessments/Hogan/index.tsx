import React, { useState, useCallback } from 'react'
import {
  Row, Col, Avatar, Input, message,
} from 'antd'

import { UserAssessment } from '~/modules/endUser/modules/campaigns/core/userAssessment/interfaces'
import { StatusText } from '~/modules/endUser/modules/campaigns/components/StatusText'
import { TruncatedTitle } from '~/modules/endUser/modules/campaigns/components/TruncatedTitle'
import { DetailsCard } from '~/glint'
import { HoganData } from '~/modules/endUser/modules/campaigns/core/campaigns'

import { PrivacyModal } from '../PrivacyModal'

import styles from './styles.less'

const { I18n } = window

interface Props {
  userAssessment: UserAssessment
  acceptPolicy(): Promise<unknown>
  view: string
  disabled: boolean
  loginHogan(url: string): Promise<{ response: HoganData }>
}

const ctaTextData = {
  in_progress: 'Continue',
  completed: '',
  not_started: 'Begin',
}

export const Hogan: React.FC<Props> = ({
  userAssessment, acceptPolicy, loginHogan, view, disabled,
}) => {
  let taskStatus = userAssessment.status
  const [hoganData, setHoganData] = useState<HoganData| null>(null)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const { assessmentIconUrl: iconUrl } = userAssessment

  const showPolicyConfirm = () => {
    if (userAssessment.needConfirm) return setShowConfirm(true)
    onLoginHogan()
  }

  const onLoginHogan = () => {
    setLoading(true)
    loginHogan(userAssessment.url).then((data) => {
      setHoganData(data.response)
    }).catch(() => {
      message.error(I18n.t('frontend.hogan.cannot_start'))
      setLoading(false)
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

  const assessmentIcon = iconUrl ? (
    <Avatar src={iconUrl} />
  ) : (
    <Avatar
      className={styles.titleAvatar}
    >
      {userAssessment.assessmentName.substring(0, 2)}
    </Avatar>
  )

  if (userAssessment.completionPercent === 100) {
    taskStatus = 'completed'
  }
  const statusElement = <StatusText taskStatus={taskStatus} />
  const titleElement = (
    <Row gutter={[4, 0]} wrap={false}>
      <Col>{assessmentIcon}</Col>
      <Col className={styles.assessmentLabel}>
        <span>
          <TruncatedTitle
            title={userAssessment.assessmentName}
          />
        </span>
      </Col>
    </Row>
  )

  return (
    <>
      <DetailsCard
        title={titleElement}
        status={statusElement}
        showStatusAtTop={view === 'list'}
        progressPercentage={userAssessment.completionPercent || 0}
        buttonText={ctaTextData[userAssessment.status]}
        actionDisabled={disabled}
        actionLoading={loading}
        actionDisabledText={I18n.t('campaign.complete_prev')}
        onButtonClick={showPolicyConfirm}
      />
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
    </>
  )
}
