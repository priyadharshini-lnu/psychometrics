import React, { useEffect } from 'react'
import { useResources } from '~/hooks/useResources'
import { Task, TaskTR } from '../core'
import { TasksList } from './TasksList'

export const Approved: React.FC = () => {
  const {
    fetch, ...args
  } = useResources<Task>('report_approvals', {
    responseType: TaskTR,
    trackUrl: true,
    apiConfig: {
      include: ['campaign', 'report', 'user', 'approval_status_owner'],
      fields: {
        users: ['name', 'email'],
        campaigns: ['name'],
        reports: ['name'],
      },
      filter: {
        approval_status_eq: 'approved ',
      },
    },
  })

  useEffect(() => {
    fetch()
  }, [])

  return (
    <div>
      <TasksList {...args} showApprover />
    </div>
  )
}
