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
          {I18n.t('threesixty.set_name_for_evaluator')}
          {' '}
          {participant && participant.evaluator.email}
        </div>
      )}
      visible={showPrompt}
      onCancel={() => setShowPrompt(false)}
      footer={null}
    >
      <Form.Item label={I18n.t('threesixty.first_name')} labelCol={{ span: 6 }} wrapperCol={{ span: 16 }}>
        {form.getFieldDecorator('firstName', {
          rules: [
            {
              required: true,
              message: I18n.t('threesixty.first_name_error'),
            },
          ],
        })(<Input
          required
          placeholder={I18n.t('threesixty.first_name')}
        />)}
      </Form.Item>
      <Form.Item label={I18n.t('threesixty.last_name')} labelCol={{ span: 6 }} wrapperCol={{ span: 16 }}>
        {form.getFieldDecorator('lastName', {
          rules: [
            {
              required: true,
              message: I18n.t('threesixty.last_name_error'),
            },
          ],
        })(<Input
          required
          placeholder={I18n.t('threesixty.last_name')}
        />)}
      </Form.Item>
      <Form.Item wrapperCol={{ span: 12, offset: 10 }}>
        <Button type="primary" htmlType="submit" onClick={submit}>
          {I18n.t('threesixty.submit')}
        </Button>
      </Form.Item>
    </Modal>
  )
}

export default Form.create({ name: 'evaluatorName' })(NameModal)
