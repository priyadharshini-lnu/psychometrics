import React from 'react'
import { Button } from 'antd'
import OptionSection from 'admin/core/threeSixtyCampaign/components/common/Options/Section'
import ExpandableOption from 'admin/core/threeSixtyCampaign/components/common/Options/Expandable'

export default function ApprovalSection ({
  options,
  updateReportOptions,
}) {
  const OBJECT_KEY = 'approval'

  const parametersForSwitch = name => ({
    value: options[name],
    onOptionChanged: updateReportOptions([OBJECT_KEY, name]),
  })

  return (
    <OptionSection label="Report Approval">
      <ExpandableOption
        label="Manager approves reports"
        {...parametersForSwitch('managerApprovesReports')}
      >
        <ExpandableOption
          label="Allow manager to view individual responses"
          {...parametersForSwitch('allowManagerViewIndividualResponses')}
          type="checkbox"
        />
        <ExpandableOption
          label="Email manager when report is ready for approval"
          {...parametersForSwitch('emailManagerWhenReportReadyForApproval')}
          type="checkbox"
          actionable={<Button size="small">Edit email</Button>}
        />
      </ExpandableOption>
      <ExpandableOption
        label="Administrator approves reports"
        {...parametersForSwitch('administratorApprovesReports')}
      />
    </OptionSection>
  )
}
