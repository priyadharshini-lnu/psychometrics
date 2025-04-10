import React, { useEffect } from 'react'
import { useResources } from '~/hooks/useResources'
import { Task, TaskTR } from '../core'
import { TasksList } from './TasksList'

const MyTasks: React.FC = () => {
  const {
    fetch, ...args
  } = useResources<Task>('report_approvals', {
    responseType: TaskTR,
    trackUrl: true,
    apiConfig: {
      include: ['campaign', 'report', 'user', 'approver_user', 'qc_user'],
      fields: {
        users: ['name', 'email'],
        campaigns: ['name'],
        reports: ['name'],
      },
      filter: {
        my_tasks: 'true',
      },
    },
  })

  useEffect(() => {
    fetch()
  }, [])

  return (
    <div>
      <TasksList {...args} type="myTasks" />
    </div>
  )
}

export default MyTasks
