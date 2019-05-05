import React from 'react'
import OptionSection from '../OptionSection'
import ExpandableOption from '../ExpandableOption'

export default function ManagerSection ({
  options,
  updateParticipantOptions,
}) {
  const OBJECT_KEY = 'evaluator'

  function parametersForSwitch (name) {
    return {
      value: options[name],
      onOptionChanged: updateParticipantOptions.bind(this, [OBJECT_KEY, name]),
    }
  }

  return (
    <OptionSection label="Evaluator Options">
      <ExpandableOption
        label="Allow evaluators to decline nomination"
        {...parametersForSwitch('canDeclineNomination')}
      >
        <ExpandableOption
          label="Email subject when a nomination is declined"
          type="checkbox"
          {...parametersForSwitch('emailSubjectWhenEvaluatorsDeclinesNomination')}
        />
      </ExpandableOption>
    </OptionSection>
  )
}
