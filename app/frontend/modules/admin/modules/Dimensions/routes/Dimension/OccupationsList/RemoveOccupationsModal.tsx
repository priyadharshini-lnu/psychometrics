import React from 'react'
import { message } from 'antd'
import AnswerableConfirmationModal from '~/components/AnswerableConfirmationModal'
import { useResourceContext } from '~/modules/admin/components/Resource'
import { Occupation } from '~/modules/admin/modules/campaigns/core/occupations'
import { SafeHTML } from '~/components/SafeHTML'

const { I18n } = window

export interface Props {
    close(): void
    occupation: Occupation
}

export const RemoveOccupationsModal: React.FC<Props> = ({ close, occupation }) => {
  const { resource: { removeResource } } = useResourceContext<Occupation>()
  const { id, name } = occupation

  const handleOnConfirm = () => removeResource(id).then(() => {
    message.info(I18n.t('frontend.clients.actions.remove.success', { clientName: name }))
    close()
  }).catch((error) => {
    message.error(error)
  })

  return (
    <AnswerableConfirmationModal
      requiredAnswer={name}
      warningMessage={<SafeHTML html={I18n.t('admin.occupations_resource_confirmations_delete_body')} />}
      confirmationMessage={I18n.t('admin.scoring_occupation_removal_confirmation')}
      onConfirm={handleOnConfirm}
      onCancel={close}
    />
  )
}
