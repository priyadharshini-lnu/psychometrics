import React, { CSSProperties, FC } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

import { CampaignAssessmentGroup } from '~/modules/admin/modules/campaigns/core/assessmentGroups'
import { GroupedAssessmentContainer } from './GroupedAssessmentContainer'

interface Props {
  sortId: string
  group: CampaignAssessmentGroup
  assessmentCount: number
  isLoading: boolean
  children: React.ReactNode
  items: string[]
  removeGroup: (groupId: number) => Promise<{ response: number }>
  updateAssessmentGroups: (groupId: number) => void
  modifyGroup: (groupdId: number, data: Partial<CampaignAssessmentGroup>) => void
  onManageTranslations?: () => void
}

export const GroupSortable: FC<Props> = ({
  sortId,
  group,
  assessmentCount,
  isLoading,
  children,
  items,
  removeGroup,
  modifyGroup,
  updateAssessmentGroups,
  onManageTranslations,
}) => {
  const {
    attributes, listeners, setNodeRef, transform, transition, isDragging,
  } = useSortable({
    id: sortId,
    data: {
      type: 'container',
      children: items,
    },
  })

  const dragStyle = {
    transform: CSS.Translate.toString(transform),
    transition,
    zIndex: isDragging ? 20 : undefined,
  } as CSSProperties

  const containerStyle: CSSProperties = { opacity: isDragging ? '0.5' : undefined }
  return (
    <GroupedAssessmentContainer
      group={group}
      assessmentCount={assessmentCount}
      isLoading={isLoading}
      ref={setNodeRef}
      attributes={attributes}
      listeners={listeners}
      dragStyle={dragStyle}
      style={containerStyle}
      modifyGroup={modifyGroup}
      removeGroup={id => removeGroup(id)}
      updateAssessmentGroups={response => updateAssessmentGroups(response)}
      onManageTranslations={onManageTranslations}
    >
      {children}
    </GroupedAssessmentContainer>
  )
}
