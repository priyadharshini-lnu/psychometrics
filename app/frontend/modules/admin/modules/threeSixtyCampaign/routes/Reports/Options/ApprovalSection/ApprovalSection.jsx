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
    <OptionSection label={I18n.t('admin.report_approval')}>
      <ExpandableOption
        label={I18n.t('admin.manager_approves_reports')}
        {...parametersForSwitch('managerApprovesReports')}
        disabled={disable}
      >
        <ExpandableOption
          label={I18n.t('admin.allow_manager_to_view_individual_responses')}
          {...parametersForSwitch('allowManagerViewIndividualResponses')}
          type="checkbox"
          disabled={disable}
        />
        <ExpandableOption
          label={I18n.t('admin.email_manager_when_report_is_ready_for_approval')}
          {...parametersForSwitch('emailManagerWhenReportReadyForApproval')}
          type="checkbox"
          actionable={(
            <Button size="small" disabled={disable}>
              {I18n.t('admin.edit_email')}
            </Button>
)}
          disabled={disable}
        />
      </ExpandableOption>
      <ExpandableOption
        label={I18n.t('admin.administrator_approves_reports')}
        {...parametersForSwitch('administratorApprovesReports')}
        disabled={disable}
      />
    </OptionSection>
  )
}
