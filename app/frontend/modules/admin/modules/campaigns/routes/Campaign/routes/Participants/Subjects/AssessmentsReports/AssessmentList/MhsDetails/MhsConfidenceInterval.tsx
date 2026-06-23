import { FC, useState } from 'react'
import {
  message, Descriptions, Switch,
} from 'antd'
import UserAssessment from '~/modules/admin/modules/campaigns/interfaces/UserAssessment'
import { I18nInterface } from '~/modules/survey/core/preview/FlowProcessor/interfaces'

interface Props {
  I18n: I18nInterface
  assessment: UserAssessment | undefined
  campaignId: string
  updateMhsConfidenceInterval: (
    campaignId: string, campaignAssessmentId: number, body: {assessment: {id: string}}
  ) => Promise<{ response: unknown; }>
}

export const MhsConfidenceInterval: FC<Props> = ({
  assessment, campaignId, I18n, updateMhsConfidenceInterval,
}) => {
  const [loading, setLoading] = useState(false)
  const currentConfidenceInterval = assessment?.mhsUserAssessmentDetails?.confidenceInterval === 1
  const [confidenceInterval, setConfidenceInterval] = useState<boolean>(currentConfidenceInterval)

  if (!assessment || assessment.category !== 'mhs') {
    return null
  }

  const { permissions } = assessment

  const handleSubmit = (checked: boolean) => {
    setLoading(true)
    setConfidenceInterval(checked)

    const payload = {
      assessment: {
        id: String(assessment.id),
        confidence_interval: checked ? 1 : 0,
      },
    }

    updateMhsConfidenceInterval(campaignId, assessment.id, payload)
      .then(() => {
        message.success(I18n.t('admin.confidence_interval_update_success'))
      })
      .catch(() => {
        setConfidenceInterval(!checked)
      })
      .finally(() => {
        setLoading(false)
      })
  }

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
          styles={{
            label: { width: '40%' },
            content: { width: '60%' },
          }}
          label={I18n.t('admin.confidence_interval')}
        >
          <Switch
            checked={confidenceInterval}
            loading={loading}
            disabled={!permissions.updateMhsConfidenceInterval}
            onChange={handleSubmit}
          />
        </Descriptions.Item>
      </Descriptions>
    </>
  )
}

export default MhsConfidenceInterval
