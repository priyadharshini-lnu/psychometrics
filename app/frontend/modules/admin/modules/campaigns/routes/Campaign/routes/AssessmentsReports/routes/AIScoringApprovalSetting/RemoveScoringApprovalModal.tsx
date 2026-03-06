import { FC } from 'react'
import { App } from 'antd'
import { RemoveResource } from '~/hooks/useResources/interfaces'
import { ConfirmationModal } from '~/glint'

const { I18n } = window

export interface Props {
  id: string
  assessmentId: string
  removeResource: RemoveResource
  close: () => void
}

export const RemoveScoringApprovalSettingModal:FC<Props> = ({
  id, removeResource, assessmentId, close,
}) => {
  const { message } = App.useApp()
  const handleOnConfirm = () => removeResource(id).then(() => {
    message.success(
      I18n.t('admin.scoring_approval_remove_modal_success', { assessmentId }),
    )
    close()
  }).catch((error) => {
    message.error(error)
  })

  return (
    <ConfirmationModal
      open
      title={I18n.t('admin.scoring_approval_modal_title')}
      message={
        I18n.t('admin.scoring_approval_remove_modal_text', { assessmentId })
      }
      onConfirm={handleOnConfirm}
      close={close}
    />
  )
}
