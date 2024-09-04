
import React, { useState } from 'react'
import { FirstLevelTabs } from '../components/FirstLevelTabs'
import Breadcrumb from '~/modules/admin/modules/campaigns/components/Breadcrumb'
import { ReportFamilyTR } from '~/modules/admin/modules/client/core/reportFamilies'
import { Resource } from '~/modules/admin/components/Resource'
import { ReportBundleFilter } from './ReportBundleFilter'
import { ReportBundleTable } from './ReportBundleTable'
import { ReportBundleFormModal } from './ReportBundleFormModal'
import { ReportBundle } from '~/modules/admin/modules/client/core/reports'

const { I18n } = window

const ReportBundleList: React.FC = () => {
  const [closed, closeModal] = useState(true)
  const [currentReportBundle, setCurrentReportBundle] = useState<ReportBundle | undefined>()
  const config = {
    trackUrl: true,
    responseType: ReportFamilyTR,
    apiConfig: {
      include_resource_meta: ['permissions'],
    },
  }

  return (
    <>
      <Breadcrumb
        crumbs={[
          {
            link: () => '/admin',
            label: () => I18n.t('reports.dashboard'),
          },
          {
            label: () => I18n.t('report_bundles.report_bundles'),
          },
        ]}
      />
      <FirstLevelTabs />
      <Resource config={config} name="report_families">
        <ReportBundleFilter openModal={() => closeModal(false)} />
        <ReportBundleTable toggleModal={(reportBundle) => {
          setCurrentReportBundle(reportBundle)
          closeModal(!reportBundle)
        }
        }
        />
        {!closed && (
          <ReportBundleFormModal currentReportBundle={currentReportBundle} close={() => { closeModal(true) }} />
        )}
      </Resource>
    </>
  )
}

export default ReportBundleList
