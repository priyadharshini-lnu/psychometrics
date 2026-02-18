import React, { useEffect } from 'react'
import { useResources } from '~/hooks/useResources'
import { Task, TaskTR } from '../core'
import { TasksList } from './TasksList'

const All: React.FC = () => {
  const {
    fetch, ...args
  } = useResources<Task>('ai_score_approvals', {
    responseType: TaskTR,
    trackUrl: true,
    apiConfig: {
      include: ['campaign', 'project', 'client', 'assessment', 'subject'],
      fields: {
        users: ['name', 'email'],
        campaigns: ['name'],
        projects: ['name'],
        clients: ['name'],
        assessments: ['name'],
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

export default All
