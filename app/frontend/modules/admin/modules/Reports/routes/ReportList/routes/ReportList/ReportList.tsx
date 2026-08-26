import React, { useState } from 'react'
import { Outlet, useSearchParams } from 'react-router-dom'
import { Resource } from '~/modules/admin/components/Resource'
import { TABLE_SETTINGS_KEYS } from '~/modules/admin/components/Resource/settingsKeys'
import { ReportTable } from './ReportTable'
import { ReportFilter } from './ReportFilter'
import { DetailsDrawer } from './DetailsDrawer'
import { Tabs } from './Tabs'
import { FirstLevelTabs } from '../../../components/FirstLevelTabs'
import { ReportFormModal } from './ReportFormModal'
import { Report, ReportTR } from '~/modules/admin/modules/client/core/reports'
import { DocumentTitle } from '~/components/DocumentTitle'

const { I18n } = window

const ReportList: React.FC<{ reportTab: string }> = ({ reportTab }) => {
  const [drawerReport, setDrawerReport] = useState<Report | undefined>()
  const [closed, closeModal] = useState(true)
  const [params] = useSearchParams()

  const assessmentId = params.get('filter[assessments_id_in]')
  const config = {
    trackUrl: true,
    responseType: ReportTR,
    apiConfig: {
      include: ['assessments', 'owner'],
      fields: { assessments: ['name', 'type'] },
      include_resource_meta: ['permissions'],
      filter: {
        with_resource_state: reportTab,
        ...(assessmentId ? { assessments_id_in: assessmentId } : {}),
      },
    },
  }

  return (
    <>
      <DocumentTitle text={I18n.t('admin.reports')} />
      <Resource
        title={I18n.t('admin.reports')}
        config={config}
        name="reports"
        settingsKey={TABLE_SETTINGS_KEYS.adminReports}
      >
        <ReportFilter openModal={() => closeModal(false)} />
        <ReportTable openDrawer={setDrawerReport} />
        {!!drawerReport && (
          <DetailsDrawer
            close={() => setDrawerReport(undefined)}
            report={drawerReport}
          />
        )}
        {!closed && (<ReportFormModal close={() => { closeModal(true) }} />)}
      </Resource>
    </>
  )
}

export const ReportsLayout: React.FC = () => (
  <>
    <FirstLevelTabs />
    <Tabs />
    <Outlet />
  </>
)

export const ActiveReports = () => <ReportList reportTab="active" />
export const ArchivedReports = () => <ReportList reportTab="archived" />
export const DeletedReports = () => <ReportList reportTab="deleted" />

export default ReportList
