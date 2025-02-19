import React from 'react'
import { message } from 'antd'
import { Idp } from 'modules/admin/modules/client/core/idp'
import { RemoveResource } from 'hooks/useResources/interfaces'
import AnswerableConfirmationModal from '~/components/AnswerableConfirmationModal'

const { I18n } = window

export interface OwnProps {
  close(): void
  idp: Idp
  removeIdp: RemoveResource
}

const RemoveIdTemplate: React.FC<OwnProps> = ({
  idp, removeIdp, close,
}) => {
  const handleOnConfirm = () => {
    removeIdp(idp.id).then(() => {
      message.info(I18n.t('administration.idp.actions.success', { idpName: idp.name }))
    }).catch((error) => {
      message.error(error)
    })
    close()
  }

  return (
    <AnswerableConfirmationModal
      requiredAnswer={idp.name}
      confirmationMessage={I18n.t('administration.idp.actions.remove_confirm')}
      onConfirm={handleOnConfirm}
      onCancel={close}
    />
  )
}

export default RemoveIdTemplate
