import React from 'react'
import { DocumentTitle } from '~/components/DocumentTitle'
import { CommunicationTemplatesList } from '../CommunicationTemplatesList'

const { I18n } = window

const CommunicationCenter: React.FC = () => (
  <>
    <DocumentTitle text={I18n.t('admin.communication_center')} />
    <CommunicationTemplatesList level="platform" />
  </>
)

export default CommunicationCenter
