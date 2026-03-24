import React from 'react'
import { message } from 'antd'
import AnswerableConfirmationModal from '~/components/AnswerableConfirmationModal'
import { useResourceContext } from '~/modules/admin/components/Resource'
import { InnovationStyles } from '~/modules/admin/modules/campaigns/core/innovationStyles'
import { SafeHTML } from '~/components/SafeHTML'

const { I18n } = window

export interface Props {
    close(): void
    innovation: InnovationStyles
}

export const RemoveInnovationStylesModal: React.FC<Props> = ({ close, innovation }) => {
  const { resource: { removeResource } } = useResourceContext<InnovationStyles>()
  const { id, name } = innovation

  const handleOnConfirm = () => removeResource(id).then(() => {
    message.info(I18n.t('frontend.clients.actions.remove.success', { clientName: name }))
    close()
  }).catch((error) => {
    message.error(error)
  })

  return (
    <AnswerableConfirmationModal
      requiredAnswer={name}
      warningMessage={<SafeHTML html={I18n.t('administration.innovation_styles.resource.confirmations.delete.body')} />}
      confirmationMessage={I18n.t('administration.scoring.innovation_style_removal_confirmation')}
      onConfirm={handleOnConfirm}
      onCancel={close}
    />
  )
}
