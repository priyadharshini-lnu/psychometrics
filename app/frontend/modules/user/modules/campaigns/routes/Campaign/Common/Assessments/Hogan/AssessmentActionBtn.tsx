import React from 'react'
import { Tooltip } from 'antd'
import {
  LoadingOutlined, CheckOutlined, PlayCircleOutlined,
} from '@ant-design/icons'
import cs from 'classnames'
import '../styles.scss'
import ConditionalWrap from 'conditional-wrap'
import { UserAssessment, Statuses } from 'modules/user/modules/campaigns/core/userAssessment/interfaces'
import ContinueIcon from '../ContinueIcon'

const { I18n } = window

interface Props {
  userAssessment: UserAssessment
  setShowConfirm(state: boolean): void
  loading: boolean
  disabled: boolean
  disabledReason: string
  loginHogan(): void
}


const AssessmentActionBtn: React.FC<Props> = ({
  userAssessment: {
    status, needConfirm,
  },
  setShowConfirm,
  loading,
  loginHogan,
  disabled,
  disabledReason,
}) => {
  const showPolicyConfirm = (e: React.MouseEvent) => {
    e.preventDefault()
    if (needConfirm) return setShowConfirm(true)

    loginHogan()
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
    <a href="#" className={cs({ disabled })} onClick={showPolicyConfirm}>
      {loading ? <LoadingOutlined /> : <ContinueIcon disabled={disabled} />}
      {' '}
      {I18n.t('threesixty.continue')}
    </a>
  )

  const beginLink = (
    <a href="#" className={cs({ disabled })} onClick={showPolicyConfirm}>
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
