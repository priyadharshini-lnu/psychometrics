import React from 'react'
import { message } from 'antd'
import { connect, ConnectedProps } from 'react-redux'
import AnswerableConfirmationModal from '~/components/AnswerableConfirmationModal'
import { createHoganCredentials } from '~/modules/admin/modules/campaigns/core/users'
import UserAssessment from '~/modules/admin/modules/campaigns/interfaces/UserAssessment'
import UserReport from '~/modules/admin/modules/campaigns/interfaces/UserReport'

const { I18n } = window

export interface OwnProps {
  close(): void
  handleCreateHoganCredentials(): void
  campaignId: string
  parsedUserId: number
  email: string
  userAssessments: UserAssessment[]
  userReports: UserReport[]
}

export const connecter = connect(
  () => ({}),
  {
    createHoganCredentials,
  },
)
export type Props = OwnProps & ConnectedProps<typeof connecter>

const CreateHoganCredentialsModal: React.FC<Props> = ({
  email,
  campaignId,
  parsedUserId,
  userAssessments,
  userReports,
  close,
  createHoganCredentials,
  handleCreateHoganCredentials,
}) => {
  const hoganAssessments = (userAssessments || [])
    .filter(assessment => assessment.category === 'hogan')
    .map(assessment => assessment.name)

  const hoganReports = (userReports || [])
    .filter(report => report.reportProvider === 'hogan')
    .map(report => report.name)

  const handleOnConfirm = async () => {
    try {
      await createHoganCredentials(campaignId, parsedUserId)
      await handleCreateHoganCredentials()
      message.success(
        I18n.t('campaign_users.details.modals.create_hogan_credentials.successfully',
          { email }),
      )
    } finally {
      close()
    }
  }

  const warningMessage = (
    <div>
      <p>{I18n.t('campaign_users.details.modals.create_hogan_credentials.warning', { email })}</p>
      {hoganAssessments.length > 0 && (
        <>
          <p>{I18n.t('campaign_users.details.modals.create_hogan_credentials.assessments')}</p>
          <ul>
            {hoganAssessments.map((name, index) => (
              <li key={index}>{name}</li>
            ))}
          </ul>
        </>
      )}

      {hoganReports.length > 0 && (
        <>
          <p>{I18n.t('campaign_users.details.modals.create_hogan_credentials.reports')}</p>
          <ul>
            {hoganReports.map((name, index) => (
              <li key={index}>{name}</li>
            ))}
          </ul>
        </>
      )}
    </div>
  )

  return (
    <AnswerableConfirmationModal
      requiredAnswer={email}
      warningMessage={warningMessage}
      confirmationMessage={
        I18n.t('campaign_users.details.modals.create_hogan_credentials.confirmation', { email })}
      onConfirm={handleOnConfirm}
      onCancel={close}
    />
  )
}

export default connecter(CreateHoganCredentialsModal)
