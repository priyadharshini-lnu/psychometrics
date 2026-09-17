import React, { useState } from 'react'
import {
  Button, Checkbox, Dropdown,
} from '@thetalententerprise/glint'
import { FilterOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import type { AssessmentColumnGroup } from '../core/groupedScoring'

const { I18n } = window

interface AssessmentGroupFilterProps {
  assessmentGroups: AssessmentColumnGroup[]
  visibleAssessmentGroupIds: string[]
  onChange: (groups: AssessmentColumnGroup[]) => void
}

export const AssessmentGroupFilter: React.FC<AssessmentGroupFilterProps> = ({
  assessmentGroups,
  visibleAssessmentGroupIds,
  onChange,
}) => {
  const [open, setOpen] = useState(false)

  const updateVisibleGroups = (groupIds: string[]) => {
    onChange(assessmentGroups.filter(group => groupIds.includes(group.id)))
  }

  const toggleVisibleGroup = (groupId: string) => {
    const groupIds = visibleAssessmentGroupIds.includes(groupId)
      ? visibleAssessmentGroupIds.filter(id => id !== groupId)
      : [...visibleAssessmentGroupIds, groupId]

    updateVisibleGroups(groupIds)
  }

  return (
    <Dropdown
      open={open}
      onOpenChange={(nextOpen, info) => {
        if (info.source !== 'menu') setOpen(nextOpen)
      }}
      trigger={['click']}
      menu={{
        items: [{
          type: 'group',
          key: 'assessment-group-filter',
          label: I18n.t('admin.scheduling_subjects_assessor_forms'),
          children: assessmentGroups.map(group => ({
            key: group.id,
            label: (
              <Checkbox
                checked={visibleAssessmentGroupIds.includes(group.id)}
                onChange={() => toggleVisibleGroup(group.id)}
              >
                {group.name}
              </Checkbox>
            ),
          })),
        }],
        onClick: ({ domEvent }) => {
          domEvent.stopPropagation()
        },
      }}
    >
      <Button icon={<FilterOutlined />}>
        {I18n.t('shared.filters')}
      </Button>
    </Dropdown>
  )
}
