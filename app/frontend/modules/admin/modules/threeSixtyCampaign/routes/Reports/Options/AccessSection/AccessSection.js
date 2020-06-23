import React from 'react'
import OptionSection from 'modules/admin/modules/threeSixtyCampaign/components/Options/Section'
import ExpandableOption from 'modules/admin/modules/threeSixtyCampaign/components/Options/Expandable'

export default function AccessSection ({
  options,
  updateReportOptions,
}) {
  const OBJECT_KEY = 'access'

  const parametersForSwitch = name => ({
    value: options[name],
    onOptionChanged: updateReportOptions([OBJECT_KEY, name]),
  })

  return (
    <OptionSection label="Report Access">
      <ExpandableOption label="Subject can access their reports" {...parametersForSwitch('selfCanAccess')} />
      <ExpandableOption label="Manager can access subject reports" {...parametersForSwitch('managerCanAccess')}>
        <ExpandableOption
          label="Manager cannot see report until requirements are met"
          {...parametersForSwitch('managerCannotSeeReportUntilRequirementsAreMet')}
          type="checkbox"
        />
      </ExpandableOption>
    </OptionSection>
  )
}
