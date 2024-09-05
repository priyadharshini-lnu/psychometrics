import React, { useEffect } from 'react'
import _ from 'lodash'
import { useParams } from 'react-router-dom'
import {
  Modal, Button, Form, Select, message,
} from 'antd'
import { LoadingOutlined, CheckOutlined } from '@ant-design/icons'
import { connect, ConnectedProps } from 'react-redux'
import UserAssessment from '~/modules/admin/modules/campaigns/interfaces/UserAssessment'

import {
  MettlScheduleRecords as MettlScheduleRecordsType, MettlScheduleRecord,
} from '~/modules/admin/modules/client/core/mettlScheduleRecords'
import { useResources } from '~/hooks/useResources/useResources'
import { RootState } from '~/modules/admin/core/rootReducers'
import {
  getSingle,
  updateMettlSchedule,
  UPDATE_METTL_SCHEDULE,
} from '~/modules/admin/modules/campaigns/core/userAssessments'
import { isRequestInProgress } from '~/core/request'

const { I18n } = window
const { Option } = Select

export interface OwnProps {
  close(): void
  campaignAssessmentId: number,
  campaignId: number
  assessment: UserAssessment
  loading: boolean
}

export type Props = OwnProps & PropsFromRedux

const connector = connect(
  (state: RootState, props: OwnProps) => ({
    assessment: getSingle(state, props.campaignAssessmentId),
    loading: isRequestInProgress(state, UPDATE_METTL_SCHEDULE),
  }),
  {
    updateMettlSchedule,
  },
)

export type PropsFromRedux = ConnectedProps<typeof connector>

export const UpdateMettlScheduleModal: React.FC<Props> = ({
  close, campaignId, loading, assessment, updateMettlSchedule, campaignAssessmentId,
}) => {
  const { projectId } = useParams<{ projectId: string }>()
  const [form] = Form.useForm()

  const handleUpdate = (params) => {
    updateMettlSchedule(campaignId, campaignAssessmentId, params).then(() => {
      message.info(I18n.t('campaign_assessment.modals.update_mettl_schedule.success_msg'))
      close()
    })
  }

  const {
    data: mettl_schedule_records, fetch: fetchMettlScheduleRecords,
  } = useResources<MettlScheduleRecordsType>(
    'mettl_schedule_records',
    {
      basePath: `projects/${projectId}`,
      trackUrl: true,
      apiConfig: { filter: { assessment_id_eq: assessment.assessmentId.toString() } },
    },
  )

  useEffect(() => {
    fetchMettlScheduleRecords()
  }, [])

  return (
    <Modal
      width={650}
      title={I18n.t('campaign_assessment.modals.update_mettl_schedule.title')}
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
          {I18n.t('campaign_assessment.modals.update_mettl_schedule.update')}
        </Button>,
      ]}
    >
      <Form
        name="basic"
        form={form}
        onFinish={handleUpdate}
        initialValues={{ mettlScheduleRecordId: assessment.mettlScheduleRecordId }}
      >
        <Form.Item name="mettlScheduleRecordId">
          <Select
            style={{ width: '100%' }}
            placeholder={I18n.t('campaign_assessment.modals.update_mettl_schedule.select_schedule')}
            showSearch
            optionFilterProp="label"
            filterOption
          >
            {_.map(mettl_schedule_records || [], (mettl_schedule_record: MettlScheduleRecord) => (
              <Option
                label={mettl_schedule_record.scheduleName}
                key={mettl_schedule_record.id}
                value={mettl_schedule_record.id}
              >
                {mettl_schedule_record.scheduleName}
              </Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default connector(UpdateMettlScheduleModal)
