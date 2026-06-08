import OptionSection from '~/modules/admin/components/Options/Section'
import ExpandableOption from '~/modules/admin/components/Options/Expandable'

export default function ManagerSection ({
  options,
  updateParticipantOptions,
}) {
  const OBJECT_KEY = 'manager'

  const parametersForSwitch = name => ({
    value: options[name],
    onChange: updateParticipantOptions([OBJECT_KEY, name]),
  })

  return (
    <OptionSection label={I18n.t('admin.options_manager_options')}>
      <ExpandableOption
        label={I18n.t('threesixty.options.manager.can_view_nominations')}
        {...parametersForSwitch('canViewNominations')}
      />
      <ExpandableOption
        label={I18n.t('threesixty.options.manager.may_choose_evaluators')}
        {...parametersForSwitch('canChooseEvaluators')}
      />
      <ExpandableOption
        label={I18n.t('threesixty.options.manager.approves_nominations')}
        {...parametersForSwitch('canApproveNominations')}
      >
        <div>
          <ExpandableOption
            label={I18n.t('threesixty.options.manager.email_managers_when_nomination_ready')}
            {...parametersForSwitch('emailManagersOnNominationApproval')}
            type="checkbox"
          />
        </div>
        <div>
          <ExpandableOption
            label={I18n.t('threesixty.options.manager.allow_subjects_to_email')}
            {...parametersForSwitch('subjectsCanEmailManagers')}
            type="checkbox"
          />
        </div>
        <div>
          <ExpandableOption
            label={I18n.t('threesixty.options.manager.email_subject_when_nomination_denied')}
            {...parametersForSwitch('emailSubjectWhenManagerDeclinesNomination')}
            type="checkbox"
          />
        </div>
      </ExpandableOption>
      <ExpandableOption
        label={I18n.t('threesixty.options.manager.approves_evaluations')}
        {...parametersForSwitch('canApprovesEvaluations')}
      />
    </OptionSection>
  )
}
