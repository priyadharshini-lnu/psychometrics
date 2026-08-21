import React, { useState } from 'react'
import {
  Alert, Badge, Button, Flex, List, Progress, Typography, useGlintToken,
} from '@thetalententerprise/glint'
import { ExpandLess, ExpandMore } from '@thetalententerprise/glint/icons'
import _ from 'lodash'
import dayjs from '~/utils/dayjs'
import { SafeHTML } from '~/components/SafeHTML'

import { AdminJob as AdminJobI } from '../../interfaces'

const { I18n } = window

type JobStatus = 'success' | 'exception' | 'active'

const statusOf = (job: AdminJobI, errorMessages: string[]): JobStatus => {
  if (errorMessages.length || job.exception || job.status === 'failed') return 'exception'
  if (job.status === 'completed') return 'success'

  return 'active'
}

const descriptionOf = (job: AdminJobI, errorMessages: string[]): string => {
  if (errorMessages.length && job.status === 'completed') {
    return I18n.t('admin_jobs.attrs.statuses.completed_with_errors')
  }

  return I18n.t(`admin_jobs.attrs.statuses.${job.status}`)
}

const AdminJob: React.FC<{ job: AdminJobI, read: (id: number) => void }> = ({ job, read }) => {
  const [expanded, setExpanded] = useState(false)
  const token = useGlintToken()
  const errorMessages = _.clone(job.errorMessages) || []
  if (job.exception) errorMessages.push(job.exception)

  const hasMore = job.isValid && (errorMessages.length || job.content || !!job.details.length)

  const title = (
    <Flex vertical gap={token.marginXXS}>
      {/* One text flow, not two flex children: side by side each wraps alone and orphans the separator. */}
      <Typography.Text>
        {I18n.t(`admin_jobs.attrs.operations.${job.operation}`)}
        {' - '}
        <Typography.Text type="secondary">{dayjs(job.createdAt).fromNow()}</Typography.Text>
      </Typography.Text>
      {job.isValid ? (
        <Typography.Link href={job.titleLink.href}>
          {job.titleLink.label}
        </Typography.Link>
      ) : (
        <Typography.Text type="secondary">{I18n.t('admin_jobs.invalid_job')}</Typography.Text>
      )}
    </Flex>
  )

  // On the avatar, not the row's trailing edge: a dot there straddles the panel edge and scrolls the panel sideways.
  const avatar = (
    <Badge dot={!job.read}>
      <Progress type="circle" percent={job.progress} size={50} status={statusOf(job, errorMessages)} />
    </Badge>
  )

  return (
    <List.Item onClick={() => { if (!job.read) read(job.id) }}>
      <Flex vertical flex={1} gap={token.marginXS}>
        <List.Item.Meta
          avatar={avatar}
          title={title}
          description={descriptionOf(job, errorMessages)}
        />

        {expanded && !!job.details.length && (
          <Alert
            title={I18n.t('admin_jobs.details')}
            type="info"
            description={job.details.map((detail, index) => (
              <Flex key={index} gap={token.marginXXS}>
                <Typography.Text strong>{`${detail[0]}:`}</Typography.Text>
                {/* Typography carries word-break, so a long filename wraps instead of scrolling the panel sideways. */}
                <Typography.Text><SafeHTML html={detail[1]} /></Typography.Text>
              </Flex>
            ))}
          />
        )}
        {expanded && job.content && (
          <Alert
            title={I18n.t('admin_jobs.results')}
            type="info"
            description={<SafeHTML html={job.content} />}
          />
        )}
        {expanded && !!errorMessages.length && (
          <Alert
            title={I18n.t('admin_jobs.errors')}
            type="error"
            description={(
              <Flex vertical gap={token.marginXXS}>
                {errorMessages.map((error, index) => <span key={index}>{error}</span>)}
              </Flex>
            )}
          />
        )}

        {hasMore && (
          <Flex justify="center">
            <Button type="link" onClick={() => setExpanded(!expanded)}>
              {expanded ? <ExpandLess /> : <ExpandMore />}
              {expanded ? I18n.t('admin_jobs.close') : I18n.t('admin_jobs.more')}
            </Button>
          </Flex>
        )}
      </Flex>
    </List.Item>
  )
}

export default AdminJob
