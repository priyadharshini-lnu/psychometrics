import React from 'react'
import { message } from 'antd'
import AnswerableConfirmationModal from 'components/AnswerableConfirmationModal'
import { RemoveResource } from 'hooks/useResources/interfaces'

const { I18n } = window

export interface Props {
  close(): void
  clientId: string
  clientName: string
  removeResource: RemoveResource
}

export const RemoveClientModal: React.FC<Props> = ({
  clientId, clientName, removeResource, close,
}) => {
  const handleOnConfirm = () => {
    removeResource(clientId).then(() => {
      message.info(I18n.t('frontend.clients.actions.remove.success', { clientName: clientName }))
    }).catch((error) => {
      message.error(error)
    })
    close()
  }

  return (
    <AnswerableConfirmationModal
      requiredAnswer={clientName}
      confirmationMessage={I18n.t('frontend.clients.actions.remove.confirmation')}
      onConfirm={handleOnConfirm}
      onCancel={close}
    />
  )
}
