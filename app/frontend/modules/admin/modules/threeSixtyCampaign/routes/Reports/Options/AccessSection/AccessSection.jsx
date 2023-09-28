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
    <OptionSection label="Report Access">
      <ExpandableOption
        label="Subject can access their reports"
        {...parametersForSwitch('selfCanAccess')}
        disabled={disable}
      >
        <ExpandableOption
          label="Disable report download"
          type="checkbox"
          {...parametersForSwitch('disableDownloadReport')}
        />
      </ExpandableOption>
      <ExpandableOption
        label="Manager can access subject reports"
        {...parametersForSwitch('managerCanAccess')}
        disabled={disable}
      >
        <ExpandableOption
          label="Manager cannot see report until requirements are met"
          {...parametersForSwitch('managerCannotSeeReportUntilRequirementsAreMet')}
          type="checkbox"
          disabled={disable}
        />
      </ExpandableOption>
    </OptionSection>
  )
}
