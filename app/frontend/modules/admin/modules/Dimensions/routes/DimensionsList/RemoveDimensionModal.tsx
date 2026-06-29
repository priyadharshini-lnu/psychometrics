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
    message.info(I18n.t('admin.dimensions_destroy_successfully', { name }))
    close()
  }).catch((error) => {
    message.error(error)
  })

  return (
    <AnswerableConfirmationModal
      requiredAnswer={name}
      warningMessage={<SafeHTML html={I18n.t('admin.dimensions_resource_confirmations_delete_body')} />}
      confirmationMessage={I18n.t('admin.dimensions_resource_confirmations_delete_message')}
      onConfirm={handleOnConfirm}
      onCancel={close}
    />
  )
}
