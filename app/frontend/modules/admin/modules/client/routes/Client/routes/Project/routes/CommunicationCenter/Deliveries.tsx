import React from 'react'
import { useParams } from 'react-router-dom'
import { DeliveriesList } from '~/modules/admin/modules/CommunicationTemplates'

export const Deliveries: React.FC = () => {
  const { projectId } = useParams() as { projectId: string }

  return <DeliveriesList scope={{ projectId }} />
}
