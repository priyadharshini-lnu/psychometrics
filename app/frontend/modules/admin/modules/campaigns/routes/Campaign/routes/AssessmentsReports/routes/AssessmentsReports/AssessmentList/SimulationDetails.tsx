import { FC, useEffect, useState } from 'react'
import {
  Descriptions, Button,
} from 'antd'
import { EditOutlined } from '@ant-design/icons'
import UpdateContentVariationForm from './UpdateContentVariationForm'
import SimulationContentVariation from '~/modules/admin/modules/campaigns/interfaces/SimulationContentVariation'
import Assessment from '~/modules/admin/modules/campaigns/interfaces/Assessment'

import { I18nInterface } from '~/modules/survey/core/preview/FlowProcessor/interfaces'

interface Props {
  I18n: I18nInterface
  assessment: Assessment | undefined
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
    const { contentVariationId } = assessment.externalConfig
    const foundVariation = (assessment.simulationContentVariations ?? []).find(
      variation => variation.id === contentVariationId,
    )
    setContentVariation(foundVariation)
  }, [assessment])

  return (
    <>
      {contentVariation ? (
        <Descriptions
          layout="horizontal"
          rootClassName="mb-6 w-100"
          bordered
          column={1}
        >
          <Descriptions.Item
            className="va-t w-30"
            labelStyle={{ width: '40%' }}
            contentStyle={{ width: '60%' }}
            label={I18n.t('campaign_assessment.column.simulation_content_variation')}
            key="simulation_content_variation"
          >
            {!isFormVisible ? (
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
            ) : (
              <UpdateContentVariationForm
                campaignId={campaignId}
                assessmentId={assessment.assessmentId}
                close={() => setIsFormVisible(false)}
                contentVariation={contentVariation}
                setContentVariation={setContentVariation}
                simulationContentVariations={assessment.simulationContentVariations || []}
              />
            )}
          </Descriptions.Item>
        </Descriptions>
      ) : null}
    </>
  )
}
