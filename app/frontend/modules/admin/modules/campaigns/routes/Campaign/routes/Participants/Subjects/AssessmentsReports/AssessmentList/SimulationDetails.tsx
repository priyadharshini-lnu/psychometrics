import { FC, useEffect, useState } from 'react'
import {
  Descriptions, Button,
} from 'antd'
import { EditOutlined } from '@ant-design/icons'
import UpdateContentVariationForm from './UpdateContentVariationForm'
import SimulationContentVariation from '~/modules/admin/modules/campaigns/interfaces/SimulationContentVariation'
import UserAssessment from '~/modules/admin/modules/campaigns/interfaces/UserAssessment'
import { I18nInterface } from '~/modules/survey/core/preview/FlowProcessor/interfaces'

interface Props {
  I18n: I18nInterface
  assessment: UserAssessment | undefined
  campaignId: string
}

export const SimulationDetails: FC<Props> = ({
  assessment,
  campaignId,
  I18n,
}) => {
  if (!assessment) {
    return null
  }

  const [contentVariation, setContentVariation] = useState<SimulationContentVariation>()
  const [isFormVisible, setIsFormVisible] = useState(false)
  const { permissions } = assessment

  useEffect(() => {
    const contentVariationId = assessment.simulationContentVariationId
    const foundVariation = (assessment.simulationContentVariations ?? []).find(
      variation => variation.id === contentVariationId,
    )
    setContentVariation(foundVariation)
  }, [assessment])

  return (
    <Descriptions
      layout="horizontal"
      rootClassName="w-100"
      bordered
      column={1}
    >
      {contentVariation && (
      <Descriptions.Item
        className="va-t w-30"
        labelStyle={{ width: '40%' }}
        contentStyle={{ width: '60%' }}
        label={I18n.t('campaign_assessment.column.simulation_content_variation')}
        key="simulation_content_variation"
      >
        {!isFormVisible && (
          <>
            {contentVariation.name}
            {permissions.updateContentVariation && (
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => setIsFormVisible(!isFormVisible)}
            />
            )}
          </>
        )}

        {isFormVisible && (
        <UpdateContentVariationForm
          campaignId={campaignId}
          userAssessmentId={assessment.id}
          close={() => setIsFormVisible(false)}
          contentVariation={contentVariation}
          setContentVariation={setContentVariation}
          simulationContentVariations={assessment.simulationContentVariations || []}
        />
        )}
      </Descriptions.Item>
      )}
    </Descriptions>
  )
}
