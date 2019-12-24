import React, { useState } from 'react'
import {
  Modal, Input, Button, Icon, Alert,
} from 'antd'

export default function AnswerableConfirmationModal ({
  confirmationTitle,
  confirmationMessage,
  requiredAnswer,
  onConfirm,
  onWrongAnswer,
  onCancel,
  children,
}) {
  const [answer, setAnswer] = useState('')
  const [error, setError] = useState(null)

  const handleOnWrongAnswer = () => {
    setError(I18n.t('threesixty.confirmation_text_incorrect'))
    if (onWrongAnswer) { onWrongAnswer() }
  }

  const handleConfirmation = () => {
    if (answer === requiredAnswer) {
      onConfirm()
    } else {
      handleOnWrongAnswer()
    }
  }

  return (
    <Modal
      width={580}
      title={<div>{confirmationTitle || I18n.t('threesixty.confirmation_required')}</div>}
      visible
      onOk={handleConfirmation}
      onCancel={onCancel}
      footer={[
        <Button key="back" onClick={onCancel}>
          Cancel
        </Button>,
        <Button key="submit" type="primary" onClick={handleConfirmation}>
          <Icon type="check" />
          Confirm
        </Button>,
      ]}
    >
      {error && <div className="mbl"><Alert message={error} type="error" /></div>}
      <div className="mbl">
        <Alert
          message={(
            <>
              {confirmationMessage}
              <div>
                <b>{requiredAnswer}</b>
              </div>
            </>
          )}
          type="warning"
        />
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
