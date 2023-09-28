import OptionSection from '~/modules/admin/components/Options/Section'
import ExpandableOption from '~/modules/admin/components/Options/Expandable'

export default function GlobalSection ({
  options,
  updateParticipantOptions,
}) {
  const OBJECT_KEY = 'global'

  const parametersForSwitch = name => ({
    value: options[name],
    onChange: updateParticipantOptions([OBJECT_KEY, name]),
  })

  return (
    <OptionSection label="Global Options">
      <ExpandableOption
        label={I18n.t('threesixty.options.global.cannot_re_edit')}
        {...parametersForSwitch('canNotEditEvaluation')}
      />
      <ExpandableOption
        label={I18n.t('threesixty.options.global.disable_all_evaluations')}
        {...parametersForSwitch('disableAllEvaluations')}
      />
    </OptionSection>
  )
}
