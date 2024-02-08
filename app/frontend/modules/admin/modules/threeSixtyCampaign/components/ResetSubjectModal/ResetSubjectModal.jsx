import { useState } from 'react'
import { Checkbox } from 'antd'
import { ConfirmationModal } from '~/glint'
import { isSuperAdmin } from '~/core/currentUser'

export default function ResetSubjectModal ({
  data: { onConfirm },
  closeModal,
  currentUser,
  open,
}) {
  const [removeLicenceUsage, setRemoveLicenceUsage] = useState(false)
  const confirmationTitle = I18n.t('threesixty.confirmation_required')
  const confirmationMessage = I18n.t('threesixty.participant_list.confirmation_messages.remove_subject')

  const handleOnConfirm = () => {
    onConfirm(removeLicenceUsage)
    closeModal()
  }

  return (
    <ConfirmationModal
      title={confirmationTitle}
      message={confirmationMessage}
      onConfirm={handleOnConfirm}
      onCancel={closeModal}
      open={open}
    >
      { isSuperAdmin(currentUser) && (
      <Checkbox checked={removeLicenceUsage} onChange={() => setRemoveLicenceUsage(!removeLicenceUsage)}>
        Mark license as deactivated
      </Checkbox>
      )
      }
    </ConfirmationModal>
  )
}
