import OptionSection from '~/modules/admin/components/Options/Section'
import ExpandableOption from '~/modules/admin/components/Options/Expandable'
import AvailabilityRequirement from '../AvailabilityRequirement'

export default function ReportAvailabilitySection ({
  options,
  updateReportOptions,
  campaignReportPermissions,
}) {
  const OBJECT_KEY = 'availability'

  const parametersForSwitch = name => ({
    value: options[name],
    onChange: updateReportOptions([OBJECT_KEY, name]),
  })

  const disable = !campaignReportPermissions.manageReportsOptions

  return (
    <OptionSection label={I18n.t('administration.threesixty_campaigns.reports.report_availability')}>
      <ExpandableOption
        label={I18n.t('administration.threesixty_campaigns.reports.make_report_available_to_subject_when')}
        {...parametersForSwitch('reportAvailableToSubjectOnCriteria')}
        disabled={disable}
      >
        <AvailabilityRequirement />
      </ExpandableOption>
      <ExpandableOption
        label={I18n.t('administration.threesixty_campaigns.reports.email_subject_when_report_becomes_available')}
        {...parametersForSwitch('emailSubjectWhenReportAvailable')}
        disabled={disable}
      />
      <ExpandableOption
        label={I18n.t('administration.threesixty_campaigns.reports.email_subjects_manager_when_available')}
        {...parametersForSwitch('emailManagerWhenReportAvailable')}
        disabled={disable}
      />
    </OptionSection>
  )
}
