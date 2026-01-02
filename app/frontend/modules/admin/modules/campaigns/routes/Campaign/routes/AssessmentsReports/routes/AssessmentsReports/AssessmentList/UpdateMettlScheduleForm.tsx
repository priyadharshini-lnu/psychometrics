import React, { useEffect } from 'react'
import _ from 'lodash'
import { useParams } from 'react-router-dom'
import {
  Button, Form, Checkbox, Select, message, Flex,
} from 'antd'
import { connect, ConnectedProps } from 'react-redux'
import { LoadingOutlined, CheckOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import Assessment from '~/modules/admin/modules/campaigns/interfaces/Assessment'
import {
  MettlScheduleRecords as MettlScheduleRecordsType, MettlScheduleRecord,
} from '~/modules/admin/modules/client/core/mettlScheduleRecords'
import { useResources } from '~/hooks/useResources/useResources'
import { RootState } from '~/modules/admin/core/rootReducers'
import { updateMettlSchedule, UPDATE_METTL_SCHEDULE } from '~/modules/admin/modules/campaigns/core/assessments/actions'
import { getSingle } from '~/modules/admin/modules/campaigns/core/assessments'
import { isRequestInProgress } from '~/core/request'

const { I18n } = window
const { Option } = Select

interface OwnProps {
  close(): void
  campaignId: number
  assessment: Assessment
  mettlScheduleRecord: MettlScheduleRecord
  loading: boolean
  setMettlScheduleRecord(record: MettlScheduleRecord): void
  updateMettlSchedule: (
    campaignId: number, assessmentId: number, body: { assessment: { id: string } }
  ) => Promise<{ response: unknown }>

}

type AssessmentIdProp = {
  campaignAssessmentId?: number
}

const connecter = connect(
  (state: RootState, props: AssessmentIdProp) => ({
    loading: isRequestInProgress(state, UPDATE_METTL_SCHEDULE),
    assessment: getSingle(state, props.campaignAssessmentId),
  }),
  {
    updateMettlSchedule,
  },
)

export type PropsFromRedux = ConnectedProps<typeof connecter>

export type Props = OwnProps & PropsFromRedux

export const UpdateMettlScheduleForm: React.FC<Props> = ({
  close, campaignId, loading, assessment, updateMettlSchedule, setMettlScheduleRecord, mettlScheduleRecord,
}) => {
  const { projectId } = useParams<{ projectId: string }>()
  const [form] = Form.useForm()

  const handleUpdate = (params) => {
    updateMettlSchedule(campaignId, assessment.id, params)
      .then(() => {
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

  const handleSelectChange = (value) => {
    const record = mettl_schedule_records.find(
      record => record.id === value,
    )

    if (record) {
      setMettlScheduleRecord(record)
    }
  }

  const handleClose = () => {
    const record = mettl_schedule_records.find(
      record => record.id === assessment.mettlScheduleRecordId,
    )

    if (record) {
      setMettlScheduleRecord(record)
    }
    close()
  }

  useEffect(() => {
    fetchMettlScheduleRecords()
  }, [])

  return (
    <Form
      name="basic"
      form={form}
      onFinish={handleUpdate}
      initialValues={{ mettlScheduleRecordId: mettlScheduleRecord.id }}
      layout="inline"
    >
      <Form.Item name="mettlScheduleRecordId" className="mbs">
        <Select
          style={{ width: '200px' }}
          placeholder={I18n.t('campaign_assessment.modals.update_mettl_schedule.select_schedule')}
          showSearch
          optionFilterProp="label"
          filterOption
          onChange={handleSelectChange}
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
      <Form.Item
        name="apply"
        valuePropName="checked"
        className="mbl"
        style={{ flex: 'auto' }}
      >
        <Checkbox>{I18n.t('campaign_assessment.modals.update_norm.apply')}</Checkbox>
      </Form.Item>
      <Flex gap={20} justify="flex-end">
        <Button key="back" onClick={handleClose}>{I18n.t('common.actions.cancel')}</Button>
        <Button
          type="primary"
          key="submit"
          htmlType="submit"
        >
          {loading ? <LoadingOutlined /> : <CheckOutlined />}
          {I18n.t('campaign_assessment.modals.update_mettl_schedule.update')}
        </Button>
      </Flex>
    </Form>
  )
}

export default connecter(UpdateMettlScheduleForm)
