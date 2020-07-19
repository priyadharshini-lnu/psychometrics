import React, { useState } from 'react'
import ConfirmationModal from 'components/ConfirmationModal'
import { Checkbox } from 'antd'

export default function ResetSubjectModal ({
  data: { onConfirm },
  closeModal,
  currentUser,
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
    >
      { currentUser.isSuperAdmin && (
      <Checkbox checked={removeLicenceUsage} onChange={() => setRemoveLicenceUsage(!removeLicenceUsage)}>
        Mark license as deactivated
      </Checkbox>
      )
      }
    </ConfirmationModal>
  )
}
