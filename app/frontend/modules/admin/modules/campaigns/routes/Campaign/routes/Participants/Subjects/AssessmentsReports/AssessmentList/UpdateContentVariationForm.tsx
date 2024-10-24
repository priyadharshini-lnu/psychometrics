import React from 'react'
import _ from 'lodash'
import {
  Button, Form, Select, message, Flex,
} from 'antd'
import { LoadingOutlined, CheckOutlined } from '@ant-design/icons'
import { connect, ConnectedProps } from 'react-redux'

import { RootState } from '~/modules/admin/core/rootReducers'
import {
  updateContentVariation,
  UPDATE_CONTENT_VARIATION,
} from '~/modules/admin/modules/campaigns/core/userAssessments'
import { isRequestInProgress } from '~/core/request'
import SimulationContentVariation from '~/modules/admin/modules/campaigns/interfaces/SimulationContentVariation'

const { I18n } = window
const { Option } = Select

interface OwnProps {
  close(): void
  campaignId: string
  userAssessmentId: number
  contentVariation: SimulationContentVariation
  setContentVariation(record: SimulationContentVariation): void
  simulationContentVariations: SimulationContentVariation[]
  loading: boolean
  updateContentVariation: (
    campaignId: string, campaignAssessmentId: number, externalConfig: object
  ) => Promise<{ response: unknown }>
}

const connecter = connect(
  (state: RootState) => ({
    loading: isRequestInProgress(state, UPDATE_CONTENT_VARIATION),
  }),
  {
    updateContentVariation,
  },
)

export type PropsFromRedux = ConnectedProps<typeof connecter>

export type Props = OwnProps & PropsFromRedux

export const UpdateContentVariationForm: React.FC<Props> = ({
  close,
  campaignId,
  loading,
  userAssessmentId,
  updateContentVariation,
  contentVariation,
  setContentVariation,
  simulationContentVariations,
}) => {
  const [form] = Form.useForm()

  const handleUpdate = (params) => {
    updateContentVariation(
      campaignId,
      userAssessmentId,
      { content_variation_id: params.contentVariationId },
    )
      .then(() => {
        message.info(I18n.t('campaign_assessment.modals.update_content_variation.success_msg'))
        close()
      })
  }

  const handleSelectChange = (value) => {
    const record = simulationContentVariations.find(
      record => record.id === value,
    )

    if (record) {
      setContentVariation(record)
    }
  }

  const handleClose = () => {
    const record = simulationContentVariations.find(
      record => record.id === contentVariation.id,
    )

    if (record) {
      setContentVariation(record)
    }
    close()
  }

  return (
    <Form
      name="basic"
      form={form}
      onFinish={handleUpdate}
      initialValues={{ contentVariationId: contentVariation.id }}
      layout="inline"
    >
      <Form.Item name="contentVariationId" className="mbs">
        <Select
          style={{ width: '200px' }}
          placeholder={I18n.t('campaign_assessment.modals.update_content_variation.select_schedule')}
          showSearch
          optionFilterProp="label"
          filterOption
          onChange={handleSelectChange}
        >
          {_.map(simulationContentVariations || [], (simulationContentVariation: SimulationContentVariation) => (
            <Option
              label={simulationContentVariation.name}
              key={simulationContentVariation.id}
              value={simulationContentVariation.id}
            >
              {simulationContentVariation.name}
            </Option>
          ))}
        </Select>
      </Form.Item>
      <Flex gap={20} justify="flex-end">
        <Button key="back" onClick={handleClose}>{I18n.t('common.actions.cancel')}</Button>
        <Button
          type="primary"
          key="submit"
          htmlType="submit"
        >
          {loading ? <LoadingOutlined /> : <CheckOutlined />}
          {I18n.t('campaign_assessment.modals.update_content_variation.update')}
        </Button>
      </Flex>
    </Form>
  )
}

export default connecter(UpdateContentVariationForm)
