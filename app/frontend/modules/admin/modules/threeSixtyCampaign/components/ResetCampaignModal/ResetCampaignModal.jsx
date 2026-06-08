import { useState } from 'react'
import { Checkbox } from 'antd'
import AnswerableConfirmationModal from '~/components/AnswerableConfirmationModal'
import { isSuperAdmin } from '~/core/currentUser'

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
      { isSuperAdmin(currentUser) && (
        <Checkbox checked={removeLicenceUsage} onChange={() => setRemoveLicenceUsage(!removeLicenceUsage)}>
          {I18n.t('admin.mark_licenses_as_deactivated')}
        </Checkbox>
      )
      }
    </AnswerableConfirmationModal>
  )
}
