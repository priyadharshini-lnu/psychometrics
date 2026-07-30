import React, { useState } from 'react'
import _ from 'lodash'
import {
  Modal, Button, Form, Checkbox, Select, message, Alert,
} from 'antd'
import { LoadingOutlined, CheckOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import Assessment from '~/modules/admin/modules/campaigns/interfaces/Assessment'
import OccupationConditionSet from '~/modules/admin/modules/campaigns/interfaces/OccupationConditionSet'
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

const UpdateConditionSetModal: React.FC<Props> = ({
  close, campaignId, loading, assessment, updateOccupationConditionSet,
}) => {
  const [form] = Form.useForm()
  const [errors, setErrors] = useState([])

  const handleUpdate = (params) => {
    updateOccupationConditionSet(campaignId, assessment.campaignAssessmentId, {
      occupationConditionSetId: params.occupationConditionSetId || null,
      applyToExistingUsers: !!params.applyToExistingUsers,
    })
      .then(() => {
        message.info(I18n.t('admin.campaign_assessment_modals_update_occupation_condition_set_success_msg'))
        close()
      }).catch(setErrors)
  }

  return (
    <Modal
      width={650}
      title={I18n.t('admin.campaign_assessment_modals_update_occupation_condition_set_title')}
      open
      onCancel={close}
      footer={[
        <Button key="back" onClick={close}>{I18n.t('common.actions.cancel')}</Button>,
        <Button
          key="submit"
          onClick={() => form.submit()}
        >
          {loading ? <LoadingOutlined /> : <CheckOutlined />}
          {I18n.t('common.actions.update')}
        </Button>,
      ]}
    >
      <Form
        name="update_occupation_condition_set"
        form={form}
        onFinish={handleUpdate}
        initialValues={{ occupationConditionSetId: assessment.occupationConditionSetId }}
      >
        {errors.length ? (
          <Alert
            message={false}
            description={_.join(errors, '\n')}
            type="error"
            className="mbm"
          />
        ) : null}
        <Form.Item name="occupationConditionSetId">
          <Select
            style={{ width: '100%' }}
            placeholder={I18n.t('admin.campaign_assessment_modals_update_occupation_condition_set_select')}
            showSearch
            optionFilterProp="label"
            filterOption
          >
            {_.map(assessment.occupationConditionSets || [], (conditionSet: OccupationConditionSet) => (
              <Option
                label={conditionSet.name}
                key={conditionSet.id}
                value={conditionSet.id}
              >
                {conditionSet.name}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item name="applyToExistingUsers" valuePropName="checked">
          <Checkbox>{I18n.t('admin.campaign_assessment_modals_update_occupation_condition_set_apply')}</Checkbox>
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default UpdateConditionSetModal
