import OptionSection from '~/modules/admin/components/Options/Section'
import ExpandableOption from '~/modules/admin/components/Options/Expandable'

export default function AccessSection ({
  options,
  campaignReportPermissions,
  updateReportOptions,
}) {
  const OBJECT_KEY = 'access'

  const parametersForSwitch = name => ({
    value: options[name],
    onChange: updateReportOptions([OBJECT_KEY, name]),
  })

  const disable = !campaignReportPermissions.manageReportsOptions

  return (
    <OptionSection label={I18n.t('administration.threesixty_campaigns.reports.report_access')}>
      <ExpandableOption
        label={I18n.t('administration.threesixty_campaigns.reports.subject_can_access_reports')}
        {...parametersForSwitch('selfCanAccess')}
        disabled={disable}
      >
        <ExpandableOption
          label={I18n.t('administration.threesixty_campaigns.reports.disable_report_download')}
          type="checkbox"
          {...parametersForSwitch('disableDownloadReport')}
        />
      </ExpandableOption>
      <ExpandableOption
        label={I18n.t('administration.threesixty_campaigns.reports.manager_can_access_subject_reports')}
        {...parametersForSwitch('managerCanAccess')}
        disabled={disable}
      >
        <ExpandableOption
          label={I18n.t('administration.threesixty_campaigns.reports.manager_cannot_access_subject_reports')}
          {...parametersForSwitch('managerCannotSeeReportUntilRequirementsAreMet')}
          type="checkbox"
          disabled={disable}
        />
      </ExpandableOption>
    </OptionSection>
  )
}
