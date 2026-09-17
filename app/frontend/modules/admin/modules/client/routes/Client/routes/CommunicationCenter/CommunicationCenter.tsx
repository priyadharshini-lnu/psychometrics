import React from 'react'
import { useParams } from 'react-router-dom'
import { DocumentTitle } from '~/components/DocumentTitle'
import { CommunicationTemplatesList } from '~/modules/admin/modules/CommunicationTemplates'

const { I18n } = window

export const CommunicationCenter: React.FC = () => {
  const { clientId } = useParams() as { clientId: string }

  return (
    <>
      <DocumentTitle text={I18n.t('admin.communication_center')} />
      <CommunicationTemplatesList level="client" scope={{ clientId }} />
    </>
  )
}
