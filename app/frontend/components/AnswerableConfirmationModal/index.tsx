import React, { ReactNode, useState } from 'react'
import {
  Modal, Input, Button, Alert, ModalProps,
} from 'antd'
import { CheckOutlined, LoadingOutlined } from '~/glint/icons/AccessibleIconsAntDesign'

interface Props {
  confirmationTitle?: string
  confirmationMessage: string
  warningMessage?: string | ReactNode
  requiredAnswer: string
  onConfirm(): void | Promise<unknown>
  onWrongAnswer?(): void
  alertType?: 'warning' | 'error'
  onCancel(): void
  children?: ReactNode
  getContainer?: ModalProps['getContainer']
}

const { I18n } = window

const AnswerableConfirmationModal: React.FC<Props> = ({
  confirmationTitle, confirmationMessage, warningMessage, requiredAnswer, onConfirm, onWrongAnswer, onCancel, children,
  alertType = 'warning', getContainer,
}) => {
  const [answer, setAnswer] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleOnWrongAnswer = () => {
    setError(I18n.t('threesixty.confirmation_text_incorrect'))
    if (onWrongAnswer) { onWrongAnswer() }
  }

  const handleConfirmation = () => {
    if (answer === requiredAnswer) {
      const confirm = onConfirm()
      if (confirm instanceof Promise) {
        setLoading(true)
        confirm.finally(() => {
          setLoading(false)
          close()
        })
      }
    } else {
      handleOnWrongAnswer()
    }
  }

  return (
    <Modal
      width={580}
      title={<div>{confirmationTitle || I18n.t('threesixty.confirmation_required')}</div>}
      open
      onOk={handleConfirmation}
      onCancel={onCancel}
      footer={[
        <Button key="back" onClick={onCancel}>
          {I18n.t('common.text.cancel')}
        </Button>,
        <Button key="submit" type="primary" onClick={handleConfirmation} disabled={loading}>
          {loading ? <LoadingOutlined /> : <CheckOutlined />}
          {I18n.t('common.text.confirm')}
        </Button>,
      ]}
      getContainer={getContainer}
    >
      {error && <div className="mbl"><Alert message={error} type="error" /></div>}
      { warningMessage && (
        <Alert
          message={(
            <>{ warningMessage }</>
            )}
          type={alertType}
        />
      )}
      <div className="mbl" />
      <div>
        {confirmationMessage}
        <div>
          <b>
            &quot;
            {requiredAnswer}
            &quot;
          </b>
        </div>
      </div>
      <Input
        className="mbm"
        placeholder={I18n.t('threesixty.confirmation_text_placeholder')}
        onChange={(e) => {
          setAnswer(e.target.value)
        }}
      />
      {children}
    </Modal>
  )
}

export default AnswerableConfirmationModal
