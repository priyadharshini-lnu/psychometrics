import React from 'react'
import { useParams } from 'react-router-dom'
import { CommunicationsEmails as CommunicationsEmail } from '~/modules/admin/modules/CommunicationTemplates'

export const DeliveryEmails: React.FC = () => {
  const { id } = useParams() as { id: string }

  return <CommunicationsEmail scope={{ deliveryId: id }} />
}
