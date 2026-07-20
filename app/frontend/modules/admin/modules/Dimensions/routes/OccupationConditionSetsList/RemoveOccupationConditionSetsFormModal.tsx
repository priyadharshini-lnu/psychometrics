import React from 'react'
import { message } from 'antd'
import AnswerableConfirmationModal from '~/components/AnswerableConfirmationModal'
import { useResourceContext } from '~/modules/admin/components/Resource'
import { OccupationConditionSet } from './interfaces'

const { I18n } = window

export const RemoveOccupationConditionSetsFormModal: React.FC<{
  close: () => void
  occupationConditionSet: OccupationConditionSet
}> = ({ close, occupationConditionSet }) => {
  const { resource } = useResourceContext<OccupationConditionSet>()
  const { id, name } = occupationConditionSet

  const handleOnConfirm = () => resource.removeResource(id).then(() => {
    message.info(I18n.t('admin.occupation_condition_sets_remove_success', { name }))
    close()
  }).catch((error) => {
    message.error(error?.base?.[0]?.title)
  })

  return (
    <AnswerableConfirmationModal
      requiredAnswer={name}
      warningMessage={I18n.t('admin.occupation_condition_sets_remove_warning', { name })}
      confirmationMessage={I18n.t('admin.occupation_condition_sets_remove_confirm')}
      onConfirm={handleOnConfirm}
      onCancel={close}
      getContainer={false}
    />
  )
}
