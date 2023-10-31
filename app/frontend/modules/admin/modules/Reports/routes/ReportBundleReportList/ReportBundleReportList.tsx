
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { FirstLevelTabs } from '../components/FirstLevelTabs'
import Breadcrumb from '~/modules/admin/modules/campaigns/components/Breadcrumb'
import { ReportBundle } from '~/modules/admin/modules/client/core/reports'
import { ReportBundleReportTR } from '~/modules/admin/modules/client/core/reportBundleReports'
import { Resource } from '~/modules/admin/components/Resource'
import { ReportBundleReportFilter } from './ReportBundleReportFilter'
import { ReportBundleReportTable } from './ReportBundleReportTable'
import { ReportBundleReportFormModal } from './ReportBundleReportFormModal'
import { useResources } from '~/hooks/useResources'

const { I18n } = window

export const ReportBundleReportList: React.FC = () => {
  const { id } = useParams<{id: string}>()
  useEffect(() => {
    fetchSingle({ id })
  }, [id])

  const { fetchSingle, getResource } = useResources<ReportBundle>('report_families', {
    apiConfig: {
      fields: { report_families: ['name'] },
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
            link: () => '/administration',
            label: () => I18n.t('reports.dashboard'),
          },
          {
            link: () => '/administration/report_families',
            label: () => I18n.t('report_bundles.report_bundles'),
          },
          {
            label: () => reportBundle.name,
          },
        ]}
      />
      <FirstLevelTabs />
      <Resource config={config} name="report_families_reports">
        <ReportBundleReportFilter openModal={() => closeModal(false)} />
        <ReportBundleReportTable />
        {!closed && (
          <ReportBundleReportFormModal close={() => { closeModal(true) }} />
        )}
      </Resource>
    </>
  )
}
