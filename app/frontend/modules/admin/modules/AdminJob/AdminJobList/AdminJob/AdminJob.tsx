import React, { useState } from 'react'
import cs from 'classnames'
import moment from 'moment'
import {
  List, Space, Alert, Progress,
} from 'antd'
import {
  DownOutlined,
  UpOutlined,
} from '@ant-design/icons'
import styles from './styles.scss'
import { AdminJob as AdminJobI } from '../../interfaces'

const { I18n } = window

const AdminJob: React.FC<{job: AdminJobI}> = ({ job }) => {
  const [expanded, setExpanded] = useState(false)
  const hasMore = job.errorMessages.length || job.content

  const getStatus = (job: AdminJobI) => {
    if (job.errorMessages.length) return 'exception'
    if (job.status === 'completed') return 'success'
    return 'active'
  }
  const getDescription = (job: AdminJobI) => {
    if (job.errorMessages.length && job.status === 'completed') {
      return I18n.t('admin_jobs.attrs.statuses.completed_with_errors')
    }
    return I18n.t(`admin_jobs.attrs.statuses.${job.status}`)
  }

  return (
    <List.Item
      className={cs({ [styles.unread]: !job.read, [styles.container]: true })}
      onClick={() => setExpanded(!expanded)
      }
      actions={[
        hasMore && (
          <More expanded={expanded} onClick={() => setExpanded(!expanded)} />
        ),
      ]}
    >
      <List.Item.Meta
        avatar={<AvatarByStatus status={getStatus(job)} progress={job.progress} />}
        title={(
          <>
            {I18n.t(`admin_jobs.attrs.operations.${job.operation}`)}
            {' '}
-
            {' '}
            <small>{moment(job.createdAt).fromNow()}</small>
          </>
        )}
        description={getDescription(job)}
      />
      {expanded && job.content && (
        <Alert
          message=""
          type="info"
          description={
            // eslint-disable-next-line react/no-danger
            <div dangerouslySetInnerHTML={{ __html: job.content }} />
          }
        />
      )}
      {expanded && !!job.errorMessages.length && (
        <Alert
          message={I18n.t('admin_jobs.errors')}
          description={(
            <ul>{job.errorMessages.map((err, i) => (<li key={i}>{err}</li>))}</ul>
          )}
          type="error"
        />
      )}
    </List.Item>
  )
}

export default AdminJob


const More: React.FC<{expanded: boolean, onClick: () => void}> = ({ expanded, onClick }) => (
  <div onClick={onClick}>
    <Space>
      {expanded ? (
        <>
          <UpOutlined />
          {I18n.t('admin_jobs.close')}
        </>
      ) : (
        <>
          <DownOutlined />
          {I18n.t('admin_jobs.more')}
        </>
      )}
    </Space>
  </div>
)

interface Props {
  status: 'success' | 'exception' | 'active'
  progress: number
}

const AvatarByStatus: React.FC<Props> = ({
  status,
  progress,
}) => <Progress type="circle" percent={progress} width={50} status={status} />
