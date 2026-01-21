import React from 'react'
import {
  Modal, Form, Button, Select, Row, Col,
} from 'antd'
import { ConnectedProps, connect } from 'react-redux'
import { updateLevel } from '~/modules/admin/modules/campaigns/core/users'

interface FormValues {
  level?: string
}

interface Props extends ConnectedProps<typeof connector> {
  close(): void
  campaignId: number
  userId: number
  level: string | null
}

const connector = connect(
  null,
  { updateLevel },
)

const { I18n } = window

export const EditLevelFormModalComponent: React.FC<Props> = ({
  close, campaignId, userId, level, updateLevel,
}) => {
  const [form] = Form.useForm<FormValues>()

  const handleFinish = (values: FormValues) => {
    updateLevel(campaignId, userId, values.level ?? null)
      .then(() => {
        close()
      })
  }

  const levelOptions = [
    { label: I18n.t('admin.level_apply'), value: 'apply' },
    { label: I18n.t('admin.level_guide'), value: 'guide' },
    { label: I18n.t('admin.level_shape'), value: 'shape' },
  ]

  return (
    <Modal
      open
      title={I18n.t('admin.edit_level')}
      onCancel={close}
      footer={
        [
          <Button onClick={close} key="cancel">
            {I18n.t('common.actions.cancel')}
          </Button>,
          <Button
            key="save"
            type="primary"
            onClick={() => form.submit()}
          >
            {I18n.t('common.actions.save')}
          </Button>,
        ]
      }
    >
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Form
            form={form}
            onFinish={handleFinish}
            initialValues={{ level }}
          >
            <Form.Item
              name="level"
              label={I18n.t('admin.level')}
            >
              <Select
                allowClear
                placeholder={I18n.t('admin.select_level')}
                options={levelOptions}
              />
            </Form.Item>
          </Form>
        </Col>
      </Row>
    </Modal>
  )
}

export const EditLevelFormModal = connector(EditLevelFormModalComponent)
