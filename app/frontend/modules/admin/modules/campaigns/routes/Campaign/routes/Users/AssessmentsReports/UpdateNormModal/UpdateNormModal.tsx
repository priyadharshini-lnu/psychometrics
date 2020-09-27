import React, { useState } from 'react'
import _ from 'lodash'
import {
  Modal, Button, Form, Select, Radio,
} from 'antd'
import { LoadingOutlined, CheckOutlined } from '@ant-design/icons'
import UserAssessment from 'modules/admin/modules/campaigns/interfaces/UserAssessment'
import Norm from 'modules/admin/modules/campaigns/interfaces/Norm'
import { PropsFromRedux } from './connect'

const { I18n } = window
const { Option } = Select

interface FormAttrs {
  normId: number
  normType: string
  apply: boolean
}

export interface OwnProps {
  close(): void
  campaignAssessmentId: number,
  campaignId: number
  userId: number
  assessment: UserAssessment
  loading: boolean
}

export type Props = OwnProps & PropsFromRedux

const UpdateNormModal: React.FC<Props> = ({
  close, campaignId, loading, assessment, updateNorm, campaignAssessmentId,
}) => {
  const [form] = Form.useForm()
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_fields, setFields] = useState({})

  const handleUpdate = (params) => {
    updateNorm(campaignId, campaignAssessmentId, params)
    close()
  }

  const isFiveScaleNormSelected = () => {
    const normId = form.getFieldValue('normId') || assessment.normId
    const selectedNormType = _.find(assessment.norms, ({ id }) => id === normId)?.normType

    return selectedNormType === 'five_scale'
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
        initialValues={{ normType: assessment.normType, normId: assessment.normId }}
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
        {isFiveScaleNormSelected() && (
        <Form.Item name="normType">
          <Radio.Group>
            <Radio value="yti">
            YTI
            </Radio>
            <Radio value="eti">
            ETI
            </Radio>
          </Radio.Group>
        </Form.Item>
        )}
      </Form>
    </Modal>
  )
}

export default UpdateNormModal
