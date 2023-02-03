import React, { useEffect } from 'react'
import { useResources } from '~/hooks/useResources'
import { Task, TaskTR } from '../core'
import { TasksList } from './TasksList'

export const All: React.FC = () => {
  const {
    fetch, ...args
  } = useResources<Task>('report_approvals', {
    responseType: TaskTR,
    apiConfig: {
      include: ['campaign', 'report', 'user'],
      fields: {
        users: ['name', 'email'],
        campaigns: ['name'],
        reports: ['name'],
      },
    },
  })

  useEffect(() => {
    fetch()
  }, [])

  return (
    <div>
      <TasksList {...args} />
    </div>
  )
}
