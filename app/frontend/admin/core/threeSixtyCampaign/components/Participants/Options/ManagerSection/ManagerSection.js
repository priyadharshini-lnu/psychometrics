import React from 'react'
import { Button } from 'antd'
import OptionSection from '../OptionSection'
import ExpandableOption from '../ExpandableOption'

export default function ManagerSection ({
  options,
  updateParticipantOptions,
}) {
  const OBJECT_KEY = 'manager'

  function parametersForSwitch (name) {
    return {
      value: options[name],
      onOptionChanged: updateParticipantOptions.bind(this, [OBJECT_KEY, name]),
    }
  }

  return (
    <OptionSection label="Manager Options">
      <ExpandableOption label="Manager Can View Nominations" {...parametersForSwitch('managerCanViewNominations')} />
      <ExpandableOption
        label="Manager May Choose Evaluators"
        {...parametersForSwitch('managerCanChooseEvaluators')}
      />
      <ExpandableOption label="Manager Approve Nominations" {...parametersForSwitch('managersApproveNominations')}>
        <div>
          <ExpandableOption
            label="Email managers when a subject's nominations are ready for approval"
            {...parametersForSwitch('emailManagersOnNominationApproval')}
            type="checkbox"
            actionable={<Button size="small">Edit email</Button>}
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
            label="Email subject when a nomination is declined"
            {...parametersForSwitch('emailSubjectsWhenManagerNominatesThem')}
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
      <ExpandableOption label="Manager Approves Evaluations" {...parametersForSwitch('managerApprovesEvaluations')} />
    </OptionSection>
  )
}
