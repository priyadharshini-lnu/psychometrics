import React from 'react'
import {
  Button, Form, Input, message, Flex, Tooltip,
} from 'antd'
import { LoadingOutlined, CheckOutlined, InfoCircleOutlined } from '@ant-design/icons'
import { connect, ConnectedProps } from 'react-redux'

import { RootState } from '~/modules/admin/core/rootReducers'
import {
  updateSimulationTimeExtension,
  UPDATE_TIME_EXTENSION,
} from '~/modules/admin/modules/campaigns/core/userAssessments'
import { isRequestInProgress } from '~/core/request'

const { I18n } = window

interface OwnProps {
  close(): void
  campaignId: string
  userAssessmentId: number
  loading: boolean
  timeExtension: number | undefined
  setTimeExtension(record: number | undefined): void
  updateSimulationTimeExtension: (
    campaignId: string, campaignAssessmentId: number, externalConfig: object
  ) => Promise<{ response: unknown }>
}

const connecter = connect(
  (state: RootState) => ({
    loading: isRequestInProgress(state, UPDATE_TIME_EXTENSION),
  }),
  {
    updateSimulationTimeExtension,
  },
)

export type PropsFromRedux = ConnectedProps<typeof connecter>

export type Props = OwnProps & PropsFromRedux

export const UpdateTimeExtensionForm: React.FC<Props> = ({
  close,
  campaignId,
  loading,
  userAssessmentId,
  timeExtension,
  setTimeExtension,
  updateSimulationTimeExtension,
}) => {
  const [form] = Form.useForm()

  const handleUpdate = (params) => {
    updateSimulationTimeExtension(
      campaignId,
      userAssessmentId,
      { timeExtension: params.timeExtension },
    )
      .then(() => {
        setTimeExtension(params.timeExtension)
        message.info(I18n.t('campaign_assessment.modals.update_simulation_time_extension.success_msg'))
        close()
      })
  }

  return (
    <Form
      name="basic"
      form={form}
      onFinish={handleUpdate}
      initialValues={{ timeExtension }}
      layout="inline"
    >
      <Form.Item
        name="timeExtension"
        label={I18n.t('campaign_assessment.modals.update_simulation_time_extension.title')}
        rules={[{ required: true }]}
      >
        <Input style={{ width: 70 }} />
      </Form.Item>
      <Tooltip title={I18n.t('campaign_assessment.modals.update_simulation_time_extension.tooltip')}>
        <span className="ant-typography-copy">
          <InfoCircleOutlined data-testid="masked-text-view" key="copy-icon" />
        </span>
      </Tooltip>
      <Flex gap={20} justify="flex-end">
        <Button key="back" onClick={close}>{I18n.t('common.actions.cancel')}</Button>
        <Button
          type="primary"
          key="submit"
          htmlType="submit"
        >
          {loading ? <LoadingOutlined /> : <CheckOutlined />}
          {I18n.t('campaign_assessment.modals.update_simulation_time_extension.update')}
        </Button>
      </Flex>
    </Form>
  )
}

export default connecter(UpdateTimeExtensionForm)
