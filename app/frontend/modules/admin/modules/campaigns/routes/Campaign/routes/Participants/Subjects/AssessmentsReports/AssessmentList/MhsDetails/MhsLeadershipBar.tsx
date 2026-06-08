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
  updateMhsLeadershipBar: (
    campaignId: string, campaignAssessmentId: number, body: {assessment: {id: string}}
  ) => Promise<{ response: unknown; }>
}

export const MhsLeadershipBar: FC<Props> = ({
  assessment, campaignId, I18n, updateMhsLeadershipBar,
}) => {
  const [loading, setLoading] = useState(false)
  const currentLeadershipBar = assessment?.mhsUserAssessmentDetails?.leadershipBar === 1
  const [leadershipBar, setLeadershipBar] = useState<boolean>(currentLeadershipBar)

  if (!assessment || assessment.category !== 'mhs') {
    return null
  }

  const { permissions } = assessment

  const handleSubmit = (checked: boolean) => {
    setLoading(true)
    setLeadershipBar(checked)

    const payload = {
      assessment: {
        id: String(assessment.id),
        leadership_bar: checked ? 1 : 0,
      },
    }

    updateMhsLeadershipBar(campaignId, assessment.id, payload)
      .then(() => {
        message.success(I18n.t('admin.leadership_bar_update_success'))
      })
      .catch(() => {
        setLeadershipBar(!checked)
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
          label={I18n.t('admin.leadership_bar')}
        >
          <Switch
            checked={leadershipBar}
            loading={loading}
            disabled={!permissions.updateMhsLeadershipBar}
            onChange={handleSubmit}
          />
        </Descriptions.Item>
      </Descriptions>
    </>
  )
}

export default MhsLeadershipBar
