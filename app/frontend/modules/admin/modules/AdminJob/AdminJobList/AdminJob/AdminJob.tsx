import React, { useState } from 'react'
import cs from 'classnames'
import {
  List, Space, Alert, Progress,
} from 'antd'
import {
  DownOutlined,
  UpOutlined,
} from '@ant-design/icons'
import _ from 'lodash'
import dayjs from '~/utils/dayjs'
import { SafeHTML } from '~/components/SafeHTML'

import { AdminJob as AdminJobI } from '../../interfaces'

import styles from './styles.less'

const { I18n } = window

const AdminJob: React.FC<{job: AdminJobI, read: (id: number) => void}> = ({ job, read }) => {
  const [expanded, setExpanded] = useState(false)
  const errorMessages = _.clone(job.errorMessages) || []
  if (job.exception) errorMessages.push(job.exception)

  const hasMore = job.isValid && (errorMessages.length || job.content || !!job.details.length)

  const getStatus = (job: AdminJobI) => {
    if (errorMessages.length || job.exception || job.status === 'failed') return 'exception'
    if (job.status === 'completed') return 'success'
    return 'active'
  }
  const getDescription = (job: AdminJobI) => {
    if (errorMessages.length && job.status === 'completed') {
      return I18n.t('admin_jobs.attrs.statuses.completed_with_errors')
    }
    return I18n.t(`admin_jobs.attrs.statuses.${job.status}`)
  }

  const handleClick = () => {
    if (!job.read) read(job.id)
  }

  return (
    <List.Item
      className={cs({ [styles.unread]: !job.read, [styles.container]: true })}
      onClick={handleClick}
    >
      <List.Item.Meta
        avatar={<AvatarByStatus status={getStatus(job)} progress={job.progress} />}
        title={(
          <>
            <div>
              {I18n.t(`admin_jobs.attrs.operations.${job.operation}`)}
              {' '}
              -
              {' '}
              <small>{dayjs(job.createdAt).fromNow()}</small>
            </div>
            <div>
              {job.isValid
                ? <a target="_blank" rel="noopener noreferrer" href={job.titleLink.href}>{job.titleLink.label}</a>
                : <div className={styles.invalidJob}>{I18n.t('admin_jobs.invalid_job')}</div>}
            </div>
          </>
        )}
        description={getDescription(job)}
      />
      {expanded && !!job.details.length && (
        <Alert
          message={I18n.t('admin_jobs.details')}
          type="info"
          description={(
            <>
              {job.details.map((el, i) => (
                <div key={i}>
                  <strong>{el[0]}</strong>
                  :
                  <span className="pl4"><SafeHTML html={el[1]} /></span>
                </div>
              ))}
            </>
)}
        />
      )}
      {expanded && job.content && (
        <Alert
          message={I18n.t('admin_jobs.results')}
          className="mt4"
          type="info"
          description={<SafeHTML html={job.content} />}
        />
      )}
      {expanded && !!errorMessages.length && (
        <Alert
          message={I18n.t('admin_jobs.errors')}
          description={(
            <ul>{errorMessages.map((err, i) => (<li key={i}>{err}</li>))}</ul>
          )}
          type="error"
        />
      )}
      {hasMore && (
      <div className={styles.more}>
        <More expanded={expanded} onClick={() => setExpanded(!expanded)} />
      </div>
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
