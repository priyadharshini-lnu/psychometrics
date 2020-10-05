import React from 'react'
import { Tooltip } from 'antd'
import {
  CheckOutlined, LoadingOutlined, PlayCircleOutlined,
} from '@ant-design/icons'
import '../styles.scss'
import cs from 'classnames'
import ConditionalWrap from 'conditional-wrap'
import { UserAssessment, Statuses } from 'modules/user/modules/campaigns/core/userAssessment/interfaces'
import ContinueIcon from '../ContinueIcon'

const { I18n } = window

interface Props {
  userAssessment: UserAssessment
  setShowConfirm(state: boolean): void
  loading: boolean
  loadAssessmentOrCheckingWizard(): void
  disabled: boolean
  disabledReason: string
}

const AssessmentActionBtn: React.FC<Props> = ({
  userAssessment: {
    mindmill, mindmillUrl, url, status, needConfirm,
  },
  setShowConfirm,
  loading,
  loadAssessmentOrCheckingWizard,
  disabled,
  disabledReason,
}) => {
  let href = url
  if (mindmill) { href = mindmillUrl }

  const showPolicyConfirm = (e: React.MouseEvent) => {
    e.preventDefault()
    if (needConfirm) return setShowConfirm(true)

    loadAssessmentOrCheckingWizard()
  }

  if (status === Statuses.COMPLETED) {
    return (
      <a>
        <CheckOutlined />
        {' '}
        {I18n.t('threesixty.completed')}
      </a>
    )
  }

  const continueLink = (
    <a href={href} className={cs({ disabled })} onClick={showPolicyConfirm}>
      {loading ? <LoadingOutlined /> : <ContinueIcon disabled={disabled} />}
      {' '}
      {I18n.t('threesixty.continue')}
    </a>
  )

  const beginLink = (
    <a href={href} className={cs({ disabled })} onClick={showPolicyConfirm}>
      {I18n.t('threesixty.begin')}
      {' '}
      {loading ? <LoadingOutlined /> : <PlayCircleOutlined />}
    </a>
  )

  return (
    <ConditionalWrap
      condition={disabled}
      wrap={children => (
        <Tooltip placement="topRight" title={disabledReason}>
          {children}
        </Tooltip>
      )}
    >
      {status === Statuses.NOT_STARTED ? beginLink : continueLink}
    </ConditionalWrap>
  )
}

export default AssessmentActionBtn
