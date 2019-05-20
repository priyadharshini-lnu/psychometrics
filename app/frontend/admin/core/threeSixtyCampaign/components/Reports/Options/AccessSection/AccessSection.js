import React from 'react'
import OptionSection from 'admin/core/threeSixtyCampaign/components/common/Options/Section'
import ExpandableOption from 'admin/core/threeSixtyCampaign/components/common/Options/Expandable'

export default function SubjectSection ({
  options
}) {
  const OBJECT_KEY = 'access'

  const parametersForSwitch = name => ({
    value: options[name],
    // onOptionChanged: updateOptions([OBJECT_KEY, name]),
  })

  return (
    <OptionSection label="Report Access">
      <ExpandableOption label="Subject can access their report" {...parametersForSwitch('selfCanAccess')} />
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
