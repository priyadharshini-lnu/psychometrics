import React from 'react'
import { message } from 'antd'
import * as t from 'io-ts'
import AnswerableConfirmationModal from '~/components/AnswerableConfirmationModal'
import { useResources } from '~/hooks/useResources'
import { type CampaignFactor } from './Factor'

const { I18n } = window

export interface Props {
  close(): void
  campaignName: string
  campaignId: string
  fetchAndUpdateFactors(): void
  fetchAndUpdateFactorGroups(): void
}

export const RemoveCampaignFactorsModal: React.FC<Props> = ({
  campaignId, campaignName, fetchAndUpdateFactors, fetchAndUpdateFactorGroups, close,
}) => {
  const {
    collectionAction,
  } = useResources<CampaignFactor>(
    'campaign_factors', {
      basePath: `campaigns/${campaignId}`,
    },
  )

  const handleOnConfirm = () => {
    collectionAction({
      action: 'remove_all',
      method: 'post',
      responseType: t.literal('ok'),
    })
      .then(() => {
        fetchAndUpdateFactors()
        fetchAndUpdateFactorGroups()
        close()
        message.success(I18n.t('administration.scoring.remove_all_campaign_factors.success'))
      })
      .catch(() => {
        close()
        message.error(I18n.t('administration.scoring.remove_all_campaign_factors.error'))
      })
  }

  return (
    <AnswerableConfirmationModal
      requiredAnswer={campaignName}
      warningMessage={I18n.t('administration.scoring.remove_all_campaign_factors.warning')}
      confirmationMessage={I18n.t('administration.scoring.remove_all_campaign_factors.confirmation')}
      onConfirm={handleOnConfirm}
      onCancel={close}
      alertType="error"
    />
  )
}
