import React from 'react'
import {
  Form, Input, Button, Modal,
} from 'antd'

function NameModal ({
  form, showPrompt, setShowPrompt, updateNomination, participant,
}) {
  const submit = () => {
    form.validateFields((err, values) => {
      if (!err) {
        updateNomination(participant.id, values)
        form.resetFields()
      }
    })
  }

  return (
    <Modal
      closable={false}
      maskClosable={false}
      title={(
        <div className="help-modal-header">
          Set name for Evaluator
          {' '}
          {participant && participant.evaluator.email}
        </div>
      )}
      visible={showPrompt}
      onCancel={() => setShowPrompt(false)}
      footer={null}
    >
      <Form.Item label="First Name" labelCol={{ span: 6 }} wrapperCol={{ span: 16 }}>
        {form.getFieldDecorator('firstName', {
          rules: [
            {
              required: true,
              message: 'Please input First Name',
            },
          ],
        })(<Input
          required
          placeholder="First name..."
        />)}
      </Form.Item>
      <Form.Item label="Last Name" labelCol={{ span: 6 }} wrapperCol={{ span: 16 }}>
        {form.getFieldDecorator('lastName', {
          rules: [
            {
              required: true,
              message: 'Please input Last Name',
            },
          ],
        })(<Input
          required
          placeholder="Last name..."
        />)}
      </Form.Item>
      <Form.Item wrapperCol={{ span: 12, offset: 10 }}>
        <Button type="primary" htmlType="submit" onClick={submit}>
          Submit
        </Button>
      </Form.Item>
    </Modal>
  )
}

export default Form.create({ name: 'evaluatorName' })(NameModal)
