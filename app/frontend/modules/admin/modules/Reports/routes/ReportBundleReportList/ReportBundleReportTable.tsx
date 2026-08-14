import React, { useState } from 'react'
import {
  Button, MenuProps, message,
} from 'antd'
import { MenuItem } from '~/interfaces/Antd'
import { Resource, useResourceContext } from '~/modules/admin/components/Resource'
import { Report } from '~/modules/admin/modules/client/core/reports'
import { ReportBundleReport } from '~/modules/admin/modules/client/core/reportBundleReports'
import { ConfirmationModal } from '~/glint'
import ConditionalDropdown from '~/components/ConditionalDropdown'
import { baseErrorMessage } from '~/hooks/useResources/utils'

const { I18n } = window

export const ReportBundleReportTable: React.FC = () => (
  <Resource.Table pagination>
    <Resource.Column<ReportBundleReport>
      title={I18n.t('common.column.id')}
      id="reportId"
      sorter
      fixed="left"
      minWidth={100}
    />
    <Resource.Column<ReportBundleReport>
      title={I18n.t('common.column.name')}
      id="name"
      fixed="left"
      minWidth={400}
    />
    <Resource.Column<ReportBundleReport>
      title={I18n.t('common.column.owner')}
      id="ownerName"
      render={reportBundleReport => reportBundleReport.ownerName || I18n.t('admin.tte')}
      width={240}
    />
    <Resource.Column<ReportBundleReport>
      title={I18n.t('common.column.package_id')}
      id="externalPackageId"
      width={300}
    />
    <Resource.Column<ReportBundleReport>
      title={I18n.t('common.column.created_at')}
      id="created_at"
      width={300}
    />
    <Resource.Column<ReportBundleReport>
      title={I18n.t('common.column.updated_at')}
      id="updated_at"
      width={300}
    />
    <Resource.Column<ReportBundleReport>
      title={I18n.t('common.column.action')}
      id="action"
      render={(_, reportBundleReport) => (
        <Dropdown reportBundleReport={reportBundleReport} />
      )}
      width={100}
    />
  </Resource.Table>
)

type DropDownProps = {
  reportBundleReport: ReportBundleReport
}
const Dropdown: React.FC<DropDownProps> = (
  { reportBundleReport },
) => {
  const [confirmation, setConfirmation] = useState(false)
  const { resource } = useResourceContext<Report>()

  const handleOnConfirm = () => resource.removeResource(reportBundleReport.id).then(() => {
    message.info(I18n.t('report_bundles.reports.actions.remove.success_message', { name: reportBundleReport.name }))
  }).catch((err) => {
    message.error(baseErrorMessage(err))
  })
  return (
    <>
      <ConfirmationModal
        open={confirmation}
        title={I18n.t('report_bundles.reports.actions.remove.confirm_title')}
        message={I18n.t(
          'report_bundles.reports.actions.remove.confirm_message',
          { name: reportBundleReport.name, report_bundle_name: reportBundleReport.bundleName },
        )}
        onConfirm={handleOnConfirm}
        close={() => setConfirmation(false)}
      />
      <ConditionalDropdown
        menu={getActionsMenuProps({
          reportBundleReport, setConfirmation,
        })}
      />
    </>

  )
}

interface ActionMenuProps {
  reportBundleReport: ReportBundleReport
  setConfirmation: (confirmation: boolean) => void
}

const getActionsMenuProps = ({
  setConfirmation, reportBundleReport,
}: ActionMenuProps): MenuProps => {
  const menuItems = [
    reportBundleReport.meta.permissions.manage && {
      key: 'remove',
      label: (
        <>
          <Button type="link" onClick={() => setConfirmation(true)} className="ps-0">
            {I18n.t('common.actions.remove')}
          </Button>
        </>
      ),
    },
  ].filter(m => m) as MenuItem[]

  return ({ items: menuItems })
}
