import React from 'react'
import _ from 'lodash'
import { Space, Table, Tooltip } from 'antd'
import { ProctoringSession } from '~/modules/admin/modules/campaigns/core/proctoringSessions'

const { I18n } = window
const { Column } = Table

interface OwnProps {
  proctoringSessions: ProctoringSession[]
}
type Props = OwnProps

export const ProctoringSessionList: React.FC<Props> = ({ proctoringSessions }) => (
  <Table className="mtm" rowKey="id" dataSource={proctoringSessions} pagination={false}>
    <Column
      title={I18n.t('administration.proctoring_sessions.columns.session_id')}
      key="sessionId"
      render={({ sessionId }) => (
        <Tooltip placement="top" title={sessionId}>
          {_.truncate(sessionId, { length: 11, omission: '...' })}
        </Tooltip>
      )}
    />
    <Column
      title={I18n.t('administration.proctoring_sessions.columns.started_at')}
      dataIndex="startedAt"
      key="startedAt"
    />
    <Column
      title={I18n.t('administration.proctoring_sessions.columns.completed_at')}
      dataIndex="completedAt"
      key="completedAt"
    />
    <Column
      title={I18n.t('administration.proctoring_sessions.columns.conclusion')}
      dataIndex="conclusion"
      key="conclusion"
    />
    <Column
      title={I18n.t('administration.proctoring_sessions.columns.score')}
      dataIndex="score"
      key="score"
    />
    <Column
      title={I18n.t('administration.proctoring_sessions.columns.comment')}
      dataIndex="comment"
      key="comment"
    />
    <Column<ProctoringSession>
      title={I18n.t('administration.proctoring_sessions.columns.links')}
      key="links"
      render={(_, { archiveUrl, reportUrl }) => (
        <Space direction="vertical">
          {archiveUrl
            && (
              <a href={archiveUrl} target="_blank" rel="noreferrer">
                {I18n.t('administration.proctoring_sessions.links.review')}
              </a>
            )}
          {reportUrl
            && (
              <a href={reportUrl} target="_blank" rel="noreferrer">
                {I18n.t('administration.proctoring_sessions.links.report')}
              </a>
            )}
        </Space>
      )}
    />
  </Table>
)
