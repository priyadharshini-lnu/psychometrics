import React, { useState } from 'react'
import _ from 'lodash'
import {
  Modal, Button, Form, Checkbox, Select, message, Alert,
} from 'antd'
import { LoadingOutlined, CheckOutlined } from '@ant-design/icons'
import Assessment from '~/modules/admin/modules/campaigns/interfaces/Assessment'
import Norm from '~/modules/admin/modules/campaigns/interfaces/Norm'
import { PropsFromRedux } from './connect'

const { I18n } = window
const { Option } = Select

export interface OwnProps {
  close(): void
  campaignId: number
  assessment: Assessment
  loading: boolean
}

export type Props = OwnProps & PropsFromRedux

const UpdateNormModal: React.FC<Props> = ({
  close, campaignId, loading, assessment, updateNorm,
}) => {
  const [form] = Form.useForm()
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_fields, setFields] = useState({})
  const [errors, setErrors] = useState([])

  const handleUpdate = (params) => {
    updateNorm(campaignId, assessment.id, params)
      .then(() => {
        message.info(I18n.t('campaign_assessment.modals.update_norm.success_msg'))
        close()
      }).catch(setErrors)
  }

  return (
    <Modal
      width={650}
      title={I18n.t('campaign_assessment.modals.update_norm.title')}
      open
      onCancel={close}
      footer={[
        <Button key="back" onClick={close}>{I18n.t('common.actions.cancel')}</Button>,
        <Button
          key="submit"
          disabled={form.getFieldValue('normId') === undefined}
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
        initialValues={{ normId: assessment.normId }}
        onFieldsChange={(_, allFields) => {
          setFields(allFields)
        }}
      >
        {errors.length ? (
          <Alert
            message={false}
            description={_.join(errors, '\n')}
            type="error"
            className="mbm"
          />
        ) : null}
        <Form.Item name="normId">
          <Select
            style={{ width: '100%' }}
            placeholder={I18n.t('campaign_assessment.modals.update_norm.select_norm')}
            showSearch
            optionFilterProp="label"
            filterOption
          >
            <Option
              key="default"
              value=""
              label="Default"
            >
              {I18n.t('common.text.default')}
            </Option>
            {_.map(assessment.norms || [], (norm: Norm) => (
              <Option
                label={norm.name}
                key={norm.id}
                value={norm.id}
              >
                {norm.name}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item name="apply" valuePropName="checked">
          <Checkbox>{I18n.t('campaign_assessment.modals.update_norm.apply')}</Checkbox>
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default UpdateNormModal
