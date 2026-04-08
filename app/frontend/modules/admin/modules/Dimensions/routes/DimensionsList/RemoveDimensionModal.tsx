import React from 'react'
import { message } from 'antd'
import AnswerableConfirmationModal from '~/components/AnswerableConfirmationModal'
import { useResourceContext } from '~/modules/admin/components/Resource'
import { Dimension } from '~/modules/admin/modules/client/core/dimensions'
import { SafeHTML } from '~/components/SafeHTML'

const { I18n } = window

export interface Props {
    close(): void
    dimension: Dimension
}

export const RemoveDimensionModal: React.FC<Props> = ({ close, dimension }) => {
  const { resource: { removeResource } } = useResourceContext<Dimension>()
  const { id, name } = dimension

  const handleOnConfirm = () => removeResource(id).then(() => {
    message.info(I18n.t('frontend.clients.actions.remove.success', { clientName: name }))
    close()
  }).catch((error) => {
    message.error(error)
  })

  return (
    <AnswerableConfirmationModal
      requiredAnswer={name}
      warningMessage={<SafeHTML html={I18n.t('administration.dimensions.resource.confirmations.delete.body')} />}
      confirmationMessage={I18n.t('administration.dimensions.resource.confirmations.delete.message')}
      onConfirm={handleOnConfirm}
      onCancel={close}
    />
  )
}
