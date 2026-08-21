import React, { useState } from 'react'
import { Form, Input, Modal } from 'antd'

interface Props {
  close(): void
  onAddScheduleTime?: (duration: number) => Promise<void>
  workshopActivityDuration?: number
}

const { I18n } = window

export const AddWorkshopActivityDurationModal: React.FC<Props> = ({
  close, onAddScheduleTime, workshopActivityDuration,
}) => {
  const [form] = Form.useForm()
  const [durationFieldError, setDurationFieldError] = useState<string>('')

  const handleClose = () => {
    if (!onAddScheduleTime) {
      close()
      return
    }

    onAddScheduleTime(form.getFieldValue('workshopActivityDuration')).then(() => {
      setDurationFieldError('')
      close()
    }).catch((err) => {
      setDurationFieldError(err[0]?.base)
    })
  }

  return (
    <Modal
      title={I18n.t('campaign_assessment.modals.workshop_activity_duration.title')}
      open
      onCancel={close}
      onOk={handleClose}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{ workshopActivityDuration }}
        feedbackIcons={() => ({ error: <></> })}
      >
        <Form.Item
          name="workshopActivityDuration"
          label={I18n.t('campaign_assessment.modals.workshop_activity_duration.form.duration')}
          rules={[{ required: true }]}
          validateStatus={durationFieldError ? 'error' : undefined}
          hasFeedback={!!durationFieldError}
          help={durationFieldError}
        >
          <Input type="number" min={1} max={480} style={{ width: '100%' }} />
        </Form.Item>
      </Form>
    </Modal>
  )
}
