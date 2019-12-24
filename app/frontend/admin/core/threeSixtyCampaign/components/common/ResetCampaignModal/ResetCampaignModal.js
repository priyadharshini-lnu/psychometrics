import React, { useState } from 'react'
import AnswerableConfirmationModal from 'components/AnswerableConfirmationModal'
import { Checkbox } from 'antd'

export default function ResetCampaignModal ({
  campaignName,
  data: { onConfirm },
  closeModal,
  currentUser,
}) {
  const [removeLicenceUsage, setRemoveLicenceUsage] = useState(false)
  const confirmationMessage = I18n.t('threesixty.reset_campaign_confirmation')

  const handleOnConfirm = () => {
    onConfirm(removeLicenceUsage)
    closeModal()
  }

  return (
    <AnswerableConfirmationModal
      show
      requiredAnswer={campaignName}
      confirmationMessage={confirmationMessage}
      onConfirm={handleOnConfirm}
      onCancel={() => closeModal('ResetCampaignModal')}
    >
      { currentUser.isSuperAdmin && (
      <Checkbox checked={removeLicenceUsage} onChange={() => setRemoveLicenceUsage(!removeLicenceUsage)}>
        Mark licenses as deactivated
      </Checkbox>
      )
      }
    </AnswerableConfirmationModal>
  )
}
