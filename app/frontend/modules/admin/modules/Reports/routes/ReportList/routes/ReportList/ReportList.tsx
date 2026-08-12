import React, { useState } from 'react'
import { Outlet, useSearchParams } from 'react-router-dom'
import { Resource } from '~/modules/admin/components/Resource'
import Breadcrumb from '~/modules/admin/modules/campaigns/components/Breadcrumb'
import { ReportTable } from './ReportTable'
import { ReportFilter } from './ReportFilter'
import { DetailsDrawer } from './DetailsDrawer'
import { Tabs } from './Tabs'
import { FirstLevelTabs } from '../../../components/FirstLevelTabs'
import { ReportFormModal } from './ReportFormModal'
import { Report, ReportTR } from '~/modules/admin/modules/client/core/reports'

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
    <Resource config={config} name="reports">
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
  )
}

// The tab strips belong to the route above the tabs, so switching tabs swaps only the list below them.
export const ReportsLayout: React.FC = () => (
  <>
    <Breadcrumb
      crumbs={[
        {
          link: () => '/admin',
          label: () => I18n.t('reports.dashboard'),
        },
        {
          label: () => I18n.t('reports.reports'),
        },
      ]}
    />
    <FirstLevelTabs />
    <Tabs />
    <Outlet />
  </>
)

export const ActiveReports = () => <ReportList reportTab="active" />
export const ArchivedReports = () => <ReportList reportTab="archived" />
export const DeletedReports = () => <ReportList reportTab="deleted" />

export default ReportList
