import React, { useEffect } from 'react'
import { useResources } from '~/hooks/useResources'
import { Task, TaskTR } from '../core'
import { TasksList } from './TasksList'

const Approved: React.FC = () => {
  const {
    fetch, ...args
  } = useResources<Task>('ai_score_approvals', {
    responseType: TaskTR,
    trackUrl: true,
    apiConfig: {
      include: ['campaign', 'project', 'client', 'assessment', 'subject', 'score_assessed_by', 'score_approved_by'],
      fields: {
        users: ['name', 'email'],
        campaigns: ['name'],
        projects: ['name'],
        clients: ['name'],
        assessments: ['name'],
      },
      filter: {
        approved: 'true',
      },
    },
  })

  useEffect(() => {
    fetch()
  }, [])

  return (
    <div>
      <TasksList {...args} type="approved" />
    </div>
  )
}

export default Approved
