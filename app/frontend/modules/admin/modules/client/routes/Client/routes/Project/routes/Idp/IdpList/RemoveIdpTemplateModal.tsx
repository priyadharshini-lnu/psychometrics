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
      message.info(I18n.t('admin.idp_actions_success', { idpName: idp.name }))
    }).catch((error) => {
      message.error(error?.base?.[0]?.title)
    })
    close()
  }

  return (
    <AnswerableConfirmationModal
      requiredAnswer={idp.name}
      confirmationMessage={I18n.t('admin.idp_actions_remove_confirm')}
      onConfirm={handleOnConfirm}
      onCancel={close}
    />
  )
}

export default RemoveIdTemplate
