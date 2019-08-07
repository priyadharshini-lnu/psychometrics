import React from 'react'
import OptionSection from 'admin/core/threeSixtyCampaign/components/common/Options/Section'
import ExpandableOption from 'admin/core/threeSixtyCampaign/components/common/Options/Expandable'

export default function ManagerSection ({
  options,
  updateParticipantOptions,
}) {
  const OBJECT_KEY = 'manager'

  const parametersForSwitch = name => ({
    value: options[name],
    onOptionChanged: updateParticipantOptions([OBJECT_KEY, name]),
  })

  return (
    <OptionSection label="Manager Options">
      <ExpandableOption label="Manager can view nominations" {...parametersForSwitch('canViewNominations')} />
      <ExpandableOption
        label="Manager May Choose Evaluators"
        {...parametersForSwitch('canChooseEvaluators')}
      />
      <ExpandableOption label="Manager approve nominations" {...parametersForSwitch('canApproveNominations')}>
        <div>
          <ExpandableOption
            label="Email managers when a subject's nominations are ready for approval"
            {...parametersForSwitch('emailManagersOnNominationApproval')}
            type="checkbox"
          />
        </div>
        <div>
          <ExpandableOption
            label="Allow subjects to email managers when their nominations are ready for approval"
            {...parametersForSwitch('subjectsCanEmailManagers')}
            type="checkbox"
          />
        </div>
        <div>
          <ExpandableOption
            label="Email subject when a nomination is denied"
            {...parametersForSwitch('emailSubjectWhenManagerDeclinesNomination')}
            type="checkbox"
          />
        </div>
      </ExpandableOption>
      <ExpandableOption label="Manager approves evaluations" {...parametersForSwitch('canApprovesEvaluations')} />
    </OptionSection>
  )
}
