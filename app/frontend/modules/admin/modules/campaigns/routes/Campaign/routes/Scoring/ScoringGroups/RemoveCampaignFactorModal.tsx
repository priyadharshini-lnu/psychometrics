import React from 'react'
import { message } from 'antd'
import AnswerableConfirmationModal from '~/components/AnswerableConfirmationModal'
import { type CampaignFactor } from './Factor'

const { I18n } = window

export interface Props {
  close(): void
  removeCampaignFactor(factorId: string): Promise<void>
  fetchAndUpdateFactors(): void
  warningMessage?: string
  factor: CampaignFactor
}

export const RemoveCampaignFactorModal: React.FC<Props> = ({
  factor, removeCampaignFactor, fetchAndUpdateFactors, close, warningMessage,
}) => {
  const handleOnConfirm = () => {
    removeCampaignFactor(factor.id).then(() => {
      message.success(I18n.t('admin.scoring_factor_removed_successfully'))
      fetchAndUpdateFactors()
      close()
    })
  }

  return (
    <AnswerableConfirmationModal
      requiredAnswer={factor.name}
      warningMessage={warningMessage}
      confirmationMessage={I18n.t('admin.scoring_factor_removal_confirmation')}
      onConfirm={handleOnConfirm}
      onCancel={close}
      alertType="error"
    />
  )
}
