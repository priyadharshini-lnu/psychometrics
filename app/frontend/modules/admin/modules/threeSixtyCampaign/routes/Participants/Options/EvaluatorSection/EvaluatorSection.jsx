import OptionSection from '~/modules/admin/components/Options/Section'
import ExpandableOption from '~/modules/admin/components/Options/Expandable'

const { I18n } = window

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
    <OptionSection
      label={I18n.t('admin.options_evaluator_options')}
    >
      <ExpandableOption
        label={I18n.t('threesixty.options.evaluator.allow_evaluators_to_decline_nomination')}
        {...parametersForSwitch('canDeclineNomination')}
      >
        <ExpandableOption
          label={I18n.t('threesixty.options.evaluator.email_subject_when_nomination_declined')}
          type="checkbox"
          {...parametersForSwitch('emailSubjectWhenEvaluatorsDeclinesNomination')}
        />
      </ExpandableOption>
    </OptionSection>
  )
}
