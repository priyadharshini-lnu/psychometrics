import {
  Table, Tag, Switch, Input, TimePicker, Space,
} from 'antd'
import { useEffect, useState } from 'react'
import dayjs from '~/utils/dayjs'

import { PROGRESS_STATUSES } from './EditSubjectDrawer'

const { I18n } = window
const { Column } = Table

export const UserAssessmentList = ({ assessments, onTimeChange }) => (
  <Table
    pagination={false}
    dataSource={assessments}
    rowKey={data => data.id}
  >
    <Column
      title={I18n.t('common.column.id')}
      dataIndex="id"
      width={50}
    />
    <Column
      title={I18n.t('common.column.assessment_name')}
      dataIndex="name"
      width="30%"
    />
    <Column
      title={I18n.t('common.column.status')}
      dataIndex="status"
      render={
            (status => <Tag color={PROGRESS_STATUSES[status].color}>{PROGRESS_STATUSES[status].label}</Tag>)
          }
      width="20%"
    />
    <Column
      title={I18n.t('common.column.schedule_time')}
      render={assessment => <ScheduleTime assessment={assessment} onTimeChange={onTimeChange} />}
    />
  </Table>
)

const ScheduleTime = ({ assessment, onTimeChange }) => {
  const { scheduleTime, status, id } = assessment
  const [active, setActive] = useState(!!scheduleTime)

  useEffect(() => {
    if (!active) { onTimeChange(null, id) }
  }, [active])
  return (
    <Space>
      <Switch
        onChange={(current) => {
          setActive(current)
          onTimeChange(dayjs(), id)
        }}
        defaultChecked={active}
        disabled={status === 'completed'}
      />
      {active ? (
        <TimePicker
          className="w-100"
          disabled={status !== 'not_started' || !active}
          format="hh:mm A"
          defaultValue={scheduleTime ? dayjs(scheduleTime) : dayjs()}
          onChange={value => onTimeChange(value, id)}
        />
      ) : <Input disabled value="Not Scheduled" />}
    </Space>
  )
}
