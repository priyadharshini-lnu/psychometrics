import OptionSection from '~/modules/admin/components/Options/Section'
import ExpandableOption from '~/modules/admin/components/Options/Expandable'

export default function ManagerSection ({
  options,
  updateParticipantOptions,
}) {
  const OBJECT_KEY = 'evaluator'

  const parametersForSwitch = name => ({
    value: options[name],
    onChange: updateParticipantOptions([OBJECT_KEY, name]),
  })

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
