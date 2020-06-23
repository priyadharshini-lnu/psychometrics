import React from 'react'
import AnswerableConfirmationModal from 'components/AnswerableConfirmationModal'

export default function CampaignNameConfirmationModal ({
  campaignName,
  closeModal,
  data,
}) {
  const handleOnConfirm = () => {
    data.onConfirm()
    closeModal()
  }

  return (
    <>
      <AnswerableConfirmationModal
        show
        requiredAnswer={campaignName}
        confirmationMessage={data.confirmationMessage}
        onConfirm={handleOnConfirm}
        onCancel={() => closeModal('CampaignNameConfirmationModal')}
      />
    </>
  )
}
