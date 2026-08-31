import React from 'react'
import { useParams } from 'react-router-dom'
import { DeliveriesList } from '~/modules/admin/modules/CommunicationTemplates'

export const Communications: React.FC = () => {
  const { campaignId } = useParams() as { campaignId: string }

  return <DeliveriesList scope={{ campaignId }} />
}
