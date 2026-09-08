import React from 'react'
import { Flex, Typography } from '@thetalententerprise/glint'
import { ResourceAvatar } from '~/glint'
import { AssessorInfo } from '../core/groupedScoring'

const { I18n } = window

interface AssessorAvatarProps {
  assessor: AssessorInfo
  showTooltip?: boolean
}

export const AssessorAvatar: React.FC<AssessorAvatarProps> = ({ assessor, showTooltip = true }) => (
  <ResourceAvatar
    name={`${assessor.firstName} ${assessor.lastName}`}
    tooltip={showTooltip ? `${assessor.firstName} ${assessor.lastName}` : undefined}
  />
)

interface AssessorLegendProps {
  assessors: AssessorInfo[]
}

export const AssessorLegend: React.FC<AssessorLegendProps> = ({ assessors }) => {
  if (assessors.length === 0) return null

  return (
    <Flex align="center" gap={16} wrap="wrap" flex={1}>
      {assessors.map(assessor => (
        <Flex align="center" gap={8} key={assessor.id}>
          <AssessorAvatar assessor={assessor} showTooltip={false} />
          <Typography.Text>
            <b>
              {I18n.t('admin.scoring_assessor_number', { number: assessor.index })}
              :
            </b>
            {' '}
            {`${assessor.firstName} ${assessor.lastName}`}
          </Typography.Text>
        </Flex>
      ))}
    </Flex>
  )
}
