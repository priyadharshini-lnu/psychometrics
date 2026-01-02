import React, { useEffect } from 'react'
import { connect, ConnectedProps } from 'react-redux'
import {
  Modal, Button, Form, Select, message,
} from 'antd'
import { LoadingOutlined, CheckOutlined } from '~/glint/icons/AccessibleIconsAntDesign'

import { updateAssessorForm, UPDATE_ASSESSOR_FORM } from '~/modules/admin/modules/campaigns/core/assessments/actions'
import { getSingle } from '~/modules/admin/modules/campaigns/core/assessments'
import { fetchAvailableAssessments, getAvailableAssessments } from '~/modules/admin/modules/campaigns/core/assessors'
import { RootState } from '~/modules/admin/core/rootReducers'

import Assessment from '~/modules/admin/modules/campaigns/interfaces/Assessment'
import { isRequestInProgress } from '~/core/request'

const { I18n } = window

type AssessmentIdProp = {
  campaignAssessmentId: number,
}

const connecter = connect(
  (state: RootState, props: AssessmentIdProp) => ({
    loading: isRequestInProgress(state, UPDATE_ASSESSOR_FORM),
    assessment: getSingle(state, props.campaignAssessmentId),
    availableAssessments: getAvailableAssessments(state),
  }),
  {
    updateAssessorForm,
    fetchAvailableAssessments,
  },
)

export type PropsFromRedux = ConnectedProps<typeof connecter>

export interface OwnProps {
  close(): void
  campaignId: number
  assessment: Assessment
  loading: boolean
}

export type Props = OwnProps & PropsFromRedux

const UpdateAssessorFormModal: React.FC<Props> = ({
  close, campaignId, loading, assessment, updateAssessorForm, fetchAvailableAssessments, availableAssessments,
}) => {
  const sortedAvailableAssessments = availableAssessments
    .sort((a, b) => (a.name.toUpperCase() >= b.name.toUpperCase() ? 1 : -1))

  useEffect(() => {
    fetchAvailableAssessments(campaignId)
  }, [])

  const [form] = Form.useForm()

  const handleUpdate = (params) => {
    updateAssessorForm(campaignId, assessment.id, params)
      .then(() => {
        message.info(I18n.t('campaign_assessment.modals.update_assessor_form.success_msg'))
        close()
      })
  }

  return (
    <Modal
      width={650}
      title={I18n.t('campaign_assessment.modals.update_assessor_form.title')}
      open
      onCancel={close}
      footer={[
        <Button key="back" onClick={close}>{I18n.t('common.actions.cancel')}</Button>,
        <Button
          key="submit"
          onClick={() => {
            form.submit()
          }}
        >
          {loading ? <LoadingOutlined /> : <CheckOutlined />}
          {I18n.t('campaign_assessment.modals.update_assessor_form.update')}
        </Button>,
      ]}
    >
      <Form
        name="basic"
        form={form}
        onFinish={handleUpdate}
        initialValues={{ assessorFormId: assessment.assessorFormName || '' }}
      >
        <Form.Item name="assessorFormId">
          <Select
            className="w-100"
            placeholder={I18n.t('campaign_assessment.modals.update_assessor_form.select_assessor')}
            showSearch
            filterOption={
              (inputVal, optionData) => (optionData?.key?.toLowerCase().includes(inputVal.toLowerCase()))
            }
          >
            <Select.Option value="">{I18n.t('common.text.na')}</Select.Option>
            {sortedAvailableAssessments.map(a => (
              <Select.Option key={a.name} value={a.id} la>
                {a.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default connecter(UpdateAssessorFormModal)
