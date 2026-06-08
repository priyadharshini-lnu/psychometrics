import _ from 'lodash'
import React from 'react'
import {
  Typography, Space, Table, Tooltip, Timeline,
} from 'antd'
import dayjs from '~/utils/dayjs'
import { ProctoringSession } from '~/modules/admin/modules/campaigns/core/proctoringSessions'
import { standardizeDateTime } from '~/utils/time'

const { I18n } = window
const { Column } = Table
const { Text } = Typography

interface OwnProps {
  proctoringSessions: ProctoringSession[]
}
type Props = OwnProps

export const ProctoringSessionList: React.FC<Props> = ({ proctoringSessions }) => (
  <Table className="mtm" rowKey="id" dataSource={proctoringSessions} pagination={false}>
    <Column
      title={I18n.t('admin.proctoring_sessions_columns_session_id')}
      key="sessionId"
      render={({ sessionId }) => (
        <Tooltip placement="top" title={sessionId}>
          {_.truncate(sessionId, { length: 11, omission: '...' })}
        </Tooltip>
      )}
    />
    <Column
      title={I18n.t('admin.assessment')}
      dataIndex="assessmentName"
      key="assessmentName"
      width={200}
    />
    <Column
      title={(
        <p className="mb-0 ta-c">
          {I18n.t('admin.timelines')}
          <span className="grey-text">{dayjs().format(' (z)')}</span>
        </p>
      )}
      key="timelines"
      width={300}
      render={({ startedAt, completedAt }) => (
        <Timeline
          titleSpan={5}
          items={
          [{
            title: I18n.t('admin.start'),
            content: <Text code>{standardizeDateTime(startedAt)}</Text>,
            styles: { root: { paddingBottom: '0.75rem' } },
          },
          {
            title: I18n.t('admin.end'),
            content: completedAt ? <Text code>{standardizeDateTime(completedAt)}</Text> : '',
            styles: { root: { paddingBottom: 0 } },
          },
          ]
        }
        />
      )}
    />
    <Column
      title={I18n.t('admin.proctoring_sessions_columns_conclusion')}
      dataIndex="conclusion"
      key="conclusion"
    />
    <Column
      title={I18n.t('admin.proctoring_sessions_columns_score')}
      dataIndex="score"
      key="score"
    />
    <Column
      title={I18n.t('admin.proctoring_sessions_columns_comment')}
      dataIndex="comment"
      key="comment"
    />
    <Column<ProctoringSession>
      title={I18n.t('admin.proctoring_sessions_columns_links')}
      key="links"
      render={(_, { archiveUrl, reportUrl }) => (
        <Space orientation="vertical">
          {archiveUrl
            && (
              <a href={archiveUrl} target="_blank" rel="noreferrer">
                {I18n.t('admin.proctoring_sessions_links_review')}
              </a>
            )}
          {reportUrl
            && (
              <a href={reportUrl} target="_blank" rel="noreferrer">
                {I18n.t('admin.proctoring_sessions_links_report')}
              </a>
            )}
        </Space>
      )}
    />
  </Table>
)
