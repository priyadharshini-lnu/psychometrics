import React from 'react'
import { useParams } from 'react-router-dom'
import { CommunicationTemplatesList } from '~/modules/admin/modules/CommunicationTemplates'

export const Templates: React.FC = () => {
  const { projectId } = useParams() as { projectId: string }

  return <CommunicationTemplatesList level="project" scope={{ projectId }} />
}
