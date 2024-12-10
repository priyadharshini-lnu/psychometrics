import React from 'react'
import { message } from 'antd'
import AnswerableConfirmationModal from '~/components/AnswerableConfirmationModal'
import { RemoveResource } from '~/hooks/useResources/interfaces'

const { I18n } = window

export interface Props {
  close(): void
  id: string
  name: string
  removeResource: RemoveResource
}

export const RemoveNormModal: React.FC<Props> = ({
  id, name, removeResource, close,
}) => {
  const handleOnConfirm = () => removeResource(id).then(() => {
    message.info(I18n.t('frontend.clients.actions.remove.success', { clientName: name }))
    close()
  }).catch((error) => {
    message.error(error)
  })

  return (
    <AnswerableConfirmationModal
      requiredAnswer={name}
      confirmationMessage={I18n.t('administration.norms.remove.confirm', { name })}
      onConfirm={handleOnConfirm}
      onCancel={close}
    />
  )
}
