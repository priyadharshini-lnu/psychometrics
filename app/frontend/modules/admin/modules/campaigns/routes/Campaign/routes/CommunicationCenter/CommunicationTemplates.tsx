import React from 'react'
import { useParams } from 'react-router-dom'
import { CommunicationTemplatesList } from '~/modules/admin/modules/CommunicationTemplates'

export const CommunicationTemplates: React.FC = () => {
  const { campaignId } = useParams() as { campaignId: string }

  return <CommunicationTemplatesList level="campaign" scope={{ campaignId }} />
}
