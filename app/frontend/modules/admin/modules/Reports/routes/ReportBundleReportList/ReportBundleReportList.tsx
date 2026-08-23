
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { FirstLevelTabs } from '../components/FirstLevelTabs'
import Breadcrumb from '~/modules/admin/modules/campaigns/components/Breadcrumb'
import { ReportBundle } from '~/modules/admin/modules/client/core/reports'
import { ReportBundleReportTR } from '~/modules/admin/modules/client/core/reportBundleReports'
import { Resource } from '~/modules/admin/components/Resource'
import { TABLE_SETTINGS_KEYS } from '~/modules/admin/components/Resource/settingsKeys'
import { ReportBundleReportFilter } from './ReportBundleReportFilter'
import { ReportBundleReportTable } from './ReportBundleReportTable'
import { ReportBundleReportFormModal } from './ReportBundleReportFormModal'
import { useResources } from '~/hooks/useResources'

const { I18n } = window

const ReportBundleReportList: React.FC = () => {
  const { id } = useParams() as {id: string}
  useEffect(() => {
    fetchSingle({ id })
  }, [id])

  const { fetchSingle, getResource } = useResources<ReportBundle>('report_families', {
    apiConfig: {
      fields: { report_families: ['name', 'tenant_id'] },
    },
  })

  const [closed, closeModal] = useState(true)

  const config = {
    trackUrl: true,
    basePath: `/report_families/${id}`,
    responseType: ReportBundleReportTR,
    apiConfig: {
      include_resource_meta: ['permissions'],
    },
  }

  const reportBundle = getResource(id)
  if (!reportBundle) return null

  return (
    <>
      <Breadcrumb
        crumbs={[
          {
            link: () => '/admin',
            label: () => I18n.t('reports.dashboard'),
          },
          {
            link: () => '/admin/report_families',
            label: () => I18n.t('report_bundles.report_bundles'),
          },
          {
            label: () => reportBundle.name,
          },
        ]}
      />
      <FirstLevelTabs />
      <Resource
        title={I18n.t('reports.reports')}
        config={config}
        name="report_families_reports"
        settingsKey={TABLE_SETTINGS_KEYS.adminReportBundlesBundleReports}
      >
        <ReportBundleReportFilter openModal={() => closeModal(false)} />
        <ReportBundleReportTable />
        {!closed && (
          <ReportBundleReportFormModal close={() => { closeModal(true) }} parent={reportBundle} />
        )}
      </Resource>
    </>
  )
}

export default ReportBundleReportList
