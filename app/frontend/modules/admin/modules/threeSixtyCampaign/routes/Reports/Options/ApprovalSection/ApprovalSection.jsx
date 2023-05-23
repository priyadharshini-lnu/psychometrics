import { Button } from 'antd'
import OptionSection from '~/modules/admin/components/Options/Section'
import ExpandableOption from '~/modules/admin/components/Options/Expandable'

export default function ApprovalSection ({
  options,
  updateReportOptions,
  campaignReportPermissions,
}) {
  const OBJECT_KEY = 'approval'

  const parametersForSwitch = name => ({
    value: options[name],
    onChange: updateReportOptions([OBJECT_KEY, name]),
  })

  const disable = !campaignReportPermissions.manageReportsOptions

  return (
    <OptionSection label="Report Approval">
      <ExpandableOption
        label="Manager approves reports"
        {...parametersForSwitch('managerApprovesReports')}
        disabled={disable}
      >
        <ExpandableOption
          label="Allow Manager to view individual responses"
          {...parametersForSwitch('allowManagerViewIndividualResponses')}
          type="checkbox"
          disabled={disable}
        />
        <ExpandableOption
          label="Email Manager when report is ready for approval"
          {...parametersForSwitch('emailManagerWhenReportReadyForApproval')}
          type="checkbox"
          actionable={<Button size="small" disabled={disable}>Edit email</Button>}
          disabled={disable}
        />
      </ExpandableOption>
      <ExpandableOption
        label="Administrator approves reports"
        {...parametersForSwitch('administratorApprovesReports')}
        disabled={disable}
      />
    </OptionSection>
  )
}
