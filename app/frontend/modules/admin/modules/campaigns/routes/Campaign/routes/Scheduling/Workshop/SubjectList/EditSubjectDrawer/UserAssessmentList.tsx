import {
  Table, Row, Col, Tag, Switch, Input, TimePicker,
} from 'antd'
import moment from 'moment-timezone'

import { PROGRESS_STATUSES } from './EditSubjectDrawer'
import settings from '~/modules/admin/modules/campaigns/settings'

const { I18n } = window
const { Column } = Table

export const UserAssessmentList = ({ assessments, onTimeAcive, onTimeChange }) => (
  <Table
    pagination={false}
    dataSource={assessments}
    rowKey={data => data.id}
  >
    <Column
      title={I18n.t('common.column.id')}
      dataIndex="id"
    />
    <Column
      title={I18n.t('common.column.assessment_name')}
      dataIndex="name"
    />
    <Column
      title={I18n.t('common.column.status')}
      dataIndex="status"
      render={
          (status => <Tag color={PROGRESS_STATUSES[status].color}>{PROGRESS_STATUSES[status].label}</Tag>)
        }
    />
    <Column
      title={I18n.t('common.column.schedule_time')}
      render={(assesment) => {
        const { schedule, id, status } = assesment
        return (
          <Row gutter={[8, 0]}>
            <Col span={4} className="flex items-center">
              <Switch
                onChange={active => onTimeAcive(active, id)}
                defaultChecked={schedule.active}
                disabled={status === 'completed'}
              />
            </Col>
            <Col span={8}>
              {schedule.active ? (
                <TimePicker
                  className="w-100"
                  disabled={status === 'completed'}
                  format="hh:mm A"
                  value={moment(schedule.time, settings.timeFormat)}
                  onChange={value => onTimeChange(value, id)}
                />
              ) : <Input disabled value="Not Scheduled" />}
            </Col>
          </Row>
        )
      }}
    />
  </Table>
)
