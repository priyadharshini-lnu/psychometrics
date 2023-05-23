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
    <OptionSection label="Report Availability">
      <ExpandableOption
        label="Make report available to subject when:"
        {...parametersForSwitch('reportAvailableToSubjectOnCriteria')}
        disabled={disable}
      >
        <AvailabilityRequirement />
      </ExpandableOption>
      <ExpandableOption
        label="Email subject when report becomes available"
        {...parametersForSwitch('emailSubjectWhenReportAvailable')}
        disabled={disable}
      />
      <ExpandableOption
        label="Email subject's manager when report becomes available"
        {...parametersForSwitch('emailManagerWhenReportAvailable')}
        disabled={disable}
      />
    </OptionSection>
  )
}
