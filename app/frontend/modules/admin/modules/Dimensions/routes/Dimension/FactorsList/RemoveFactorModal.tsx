import React from 'react'
import { message } from 'antd'
import AnswerableConfirmationModal from '~/components/AnswerableConfirmationModal'
import { useResourceContext } from '~/modules/admin/components/Resource'
import { Factor } from '~/modules/admin/modules/campaigns/core/factors'
import { SafeHTML } from '~/components/SafeHTML'

const { I18n } = window

export interface Props {
    close(): void
    factor: Factor
}

export const RemoveFactorModal: React.FC<Props> = ({ close, factor }) => {
  const { resource: { removeResource } } = useResourceContext<Factor>()
  const { id, name } = factor

  const handleOnConfirm = () => removeResource(id).then(() => {
    message.info(I18n.t('frontend.clients.actions.remove.success', { clientName: name }))
    close()
  }).catch((error) => {
    message.error(error)
  })

  return (
    <AnswerableConfirmationModal
      requiredAnswer={name || ''}
      warningMessage={<SafeHTML html={I18n.t('admin.factors_resource_confirmations_delete_body')} />}
      confirmationMessage={I18n.t('admin.scoring_factor_removal_confirmation')}
      onConfirm={handleOnConfirm}
      onCancel={close}
    />
  )
}
