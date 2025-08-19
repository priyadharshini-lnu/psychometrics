import React from 'react'
import { message } from 'antd'
import AnswerableConfirmationModal from '~/components/AnswerableConfirmationModal'
import { PropsFromRedux } from './connect'

const { I18n } = window

export interface OwnProps {
  close(): void
  campaign: {
    id: number
    name: string
    isTemplate: boolean
  }
  projectId: number
}

export type Props = OwnProps & PropsFromRedux

const RemoveCampaignModal: React.FC<Props> = ({
  campaign, remove, projectId, close,
}) => {
  const handleOnConfirm = () => {
    remove(campaign.id, projectId).then(() => {
      message.info(I18n.t('frontend.campaign.actions.remove.success', { campaignName: campaign.name }))
    }).catch((error) => {
      message.error(error)
    })
    close()
  }

  return (
    <AnswerableConfirmationModal
      requiredAnswer={campaign.name}
      confirmationMessage={campaign.isTemplate
        ? I18n.t('frontend.campaign.actions.remove.template_confirmation')
        : I18n.t('frontend.campaign.actions.remove.confirmation')}
      onConfirm={handleOnConfirm}
      onCancel={close}
    />
  )
}

export default RemoveCampaignModal
