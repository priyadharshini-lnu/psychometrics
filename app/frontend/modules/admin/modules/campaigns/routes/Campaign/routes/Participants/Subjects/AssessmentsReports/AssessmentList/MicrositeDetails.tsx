import { FC } from 'react'
import {
  Button, Descriptions, message, Tag, Tooltip,
} from 'antd'
import { CopyOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import UserAssessment from '~/modules/admin/modules/campaigns/interfaces/UserAssessment'
import { I18nInterface } from '~/modules/survey/core/preview/FlowProcessor/interfaces'

interface Props {
  I18n: I18nInterface
  assessment: UserAssessment | undefined
}

const getStatusColor = (status: string | null) => {
  switch (status) {
    case 'registered':
      return 'success'
    case 'pending':
      return 'processing'
    case 'failed':
      return 'error'
    default:
      return 'default'
  }
}

export const MicrositeDetails: FC<Props> = ({
  assessment,
  I18n,
}) => {
  if (!assessment || assessment.category !== 'microsite') {
    return null
  }

  const details = assessment.micrositeUserAssessmentDetails
  const errorMessage = details?.errorMessage?.trim() ?? ''

  return (
    <>
      <Descriptions
        layout="horizontal"
        rootClassName="w-100"
        bordered
        column={1}
      >
        <Descriptions.Item
          className="va-t w-30"
          labelStyle={{ width: '40%' }}
          contentStyle={{ width: '60%' }}
          label={I18n.t('campaign_assessment.column.microsite_participant_id')}
          key="microsite_participant_id"
        >
          {details?.participantId ?? '-'}
        </Descriptions.Item>
        <Descriptions.Item
          className="va-t w-30"
          labelStyle={{ width: '40%' }}
          contentStyle={{ width: '60%' }}
          label={I18n.t('campaign_assessment.column.microsite_assessment_url')}
          key="microsite_assessment_url"
        >
          {details?.assessmentUrl ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <a href={details.assessmentUrl} target="_blank" rel="noopener noreferrer">
                {details.assessmentUrl}
              </a>
              <Tooltip title={I18n.t('shared.copy')}>
                <Button
                  type="text"
                  size="small"
                  icon={<CopyOutlined />}
                  onClick={() => {
                    navigator.clipboard.writeText(details.assessmentUrl!)
                    message.success(I18n.t('shared.copied_to_clipboard'))
                  }}
                />
              </Tooltip>
            </span>
          ) : '-'}
        </Descriptions.Item>
        <Descriptions.Item
          className="va-t w-30"
          labelStyle={{ width: '40%' }}
          contentStyle={{ width: '60%' }}
          label={I18n.t('campaign_assessment.column.microsite_registration_status')}
          key="microsite_registration_status"
        >
          <Tag color={getStatusColor(details?.registrationStatus ?? null)}>
            {details?.registrationStatus ?? '-'}
          </Tag>
        </Descriptions.Item>
        {errorMessage ? (
          <Descriptions.Item
            className="va-t w-30"
            labelStyle={{ width: '40%' }}
            contentStyle={{ width: '60%' }}
            label={I18n.t('campaign_assessment.column.microsite_error_message')}
            key="microsite_error_message"
          >
            <span style={{ color: '#cf1322' }}>{errorMessage}</span>
          </Descriptions.Item>
        ) : null}
      </Descriptions>
    </>
  )
}
