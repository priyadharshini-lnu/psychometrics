import React, { useState, useEffect } from 'react'
import _ from 'lodash'
import {
  Modal, Button, Form, Checkbox, Select, Radio,
} from 'antd'
import { LoadingOutlined, CheckOutlined } from '@ant-design/icons'
import Assessment from 'modules/admin/modules/campaigns/interfaces/Assessment'
import Norm from 'modules/admin/modules/campaigns/interfaces/Norm'

const { I18n } = window
const { Option } = Select

interface FormAttrs {
  normId: number
  normType: string
  apply: boolean
}

interface Props {
  close(): void
  fetchNorms(campaignId: number, assessmentId: number): void
  updateNorm(campaignId: number, assessmentId: number, body: FormAttrs): void
  campaignId: number
  assessment: Assessment
  loading: boolean
}

const UpdateNormModal: React.FC<Props> = ({
  close, fetchNorms, campaignId, loading, assessment, updateNorm,
}) => {
  const [form] = Form.useForm()
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_fields, setFields] = useState({})

  useEffect(() => {
    fetchNorms(campaignId, assessment.id)
  }, [])

  const handleUpdate = (params) => {
    updateNorm(campaignId, assessment.id, params)
    close()
  }
  return (
    <Modal
      width={650}
      title={I18n.t('campaign_assessment.modals.update_norm.title')}
      visible
      onCancel={close}
      footer={[
        <Button key="back" onClick={close}>{I18n.t('common.actions.cancel')}</Button>,
        <Button
          key="submit"
          disabled={!form.getFieldValue('normId')}
          onClick={() => {
            form.submit()
          }}
        >
          {loading ? <LoadingOutlined /> : <CheckOutlined />}
          {I18n.t('campaign_assessment.modals.update_norm.update')}
        </Button>,
      ]}
    >
      <Form
        name="basic"
        form={form}
        onFinish={handleUpdate}
        initialValues={{ normType: 'YTI' }}
        onFieldsChange={(_, allFields) => {
          setFields(allFields)
        }}
      >
        <Form.Item name="normId">
          <Select style={{ width: '100%' }} placeholder={I18n.t('campaign_assessment.modals.update_norm.select_norm')}>
            {_.map(assessment.norms || [], (norm: Norm) => (
              <Option
                key={norm.id}
                value={norm.id}
              >
                {norm.name}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item name="normType">
          <Radio.Group>
            <Radio value="YTI">
            YTI
            </Radio>
            <Radio value="ETI">
            ETI
            </Radio>
          </Radio.Group>
        </Form.Item>
        <Form.Item name="apply" valuePropName="checked">
          <Checkbox>{I18n.t('campaign_assessment.modals.update_norm.apply')}</Checkbox>
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default UpdateNormModal
