import { FC, CSSProperties } from 'react'
import { CSS } from '@dnd-kit/utilities'
import { useSortable } from '@dnd-kit/sortable'

import { CampaignAssessment } from '~/modules/admin/modules/campaigns/core/assessmentGroups'
import { Assessment } from './Assessment'

interface Props {
  sortId: string
  assessment?: CampaignAssessment
  span?: number
  disabled?: boolean | null
  onEditScheduleTime?: () => void
}

export const AssessmentSortable: FC<Props> = ({
  assessment, sortId, span, disabled, onEditScheduleTime,
}) => {
  const {
    attributes, listeners, setNodeRef, transform, transition, isDragging,
  } = useSortable({
    id: sortId,
    transition: {
      duration: 150,
      easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
    },
  })

  const dragStyles = {
    transform: CSS.Translate.toString(transform),
    transition,
    zIndex: isDragging ? 20 : undefined,
  } as CSSProperties

  const containerStyles = {
    opacity: isDragging ? 0.5 : undefined,
  }

  return (
    <Assessment
      assessment={assessment}
      attributes={attributes}
      dragStyles={dragStyles}
      listeners={listeners}
      ref={disabled ? null : setNodeRef}
      span={span}
      style={containerStyles}
      onEditScheduleTime={onEditScheduleTime}
    />
  )
}
