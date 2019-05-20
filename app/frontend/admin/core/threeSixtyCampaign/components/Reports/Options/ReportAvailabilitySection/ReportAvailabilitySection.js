import React from 'react'
import OptionSection from 'admin/core/threeSixtyCampaign/components/common/Options/Section'
import ExpandableOption from 'admin/core/threeSixtyCampaign/components/common/Options/Expandable'

export default function ReportAvailabilitySection ({
  options,
  updateReportOptions,
}) {
  const OBJECT_KEY = 'availability'

  const parametersForSwitch = name => ({
    value: options[name],
    onOptionChanged: updateReportOptions([OBJECT_KEY, name]),
  })

  return (
    <OptionSection label="Report Availability">
      <ExpandableOption label="Email subject when report becomes available" {...parametersForSwitch('emailSubjectWhenReportAvailable')} />
      <ExpandableOption label="Email subject's manager when report becomes available" {...parametersForSwitch('emailManagerWhenReportAvailable')} />
    </OptionSection>
  )
}
