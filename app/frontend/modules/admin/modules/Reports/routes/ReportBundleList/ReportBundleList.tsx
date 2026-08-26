
import React, { useState } from 'react'
import { FirstLevelTabs } from '../components/FirstLevelTabs'
import { Resource } from '~/modules/admin/components/Resource'
import { TABLE_SETTINGS_KEYS } from '~/modules/admin/components/Resource/settingsKeys'
import { ReportBundleFilter } from './ReportBundleFilter'
import { ReportBundleTable } from './ReportBundleTable'
import { ReportBundleFormModal } from './ReportBundleFormModal'
import { ReportBundle, ReportBundleTR } from '~/modules/admin/modules/client/core/reports'
import { DocumentTitle } from '~/components/DocumentTitle'

const { I18n } = window

const ReportBundleList: React.FC = () => {
  const [closed, closeModal] = useState(true)
  const [currentReportBundle, setCurrentReportBundle] = useState<ReportBundle | undefined>()
  const config = {
    trackUrl: true,
    responseType: ReportBundleTR,
    apiConfig: {
      include_resource_meta: ['permissions'],
      include: ['tenant'],
    },
  }

  return (
    <>
      <DocumentTitle text={I18n.t('report_bundles.report_bundles')} />
      <FirstLevelTabs />
      <Resource
        title={I18n.t('report_bundles.report_bundles')}
        config={config}
        name="report_families"
        settingsKey={TABLE_SETTINGS_KEYS.adminReportBundles}
      >
        <ReportBundleFilter openModal={() => closeModal(false)} />
        <ReportBundleTable toggleModal={(reportBundle) => {
          setCurrentReportBundle(reportBundle)
          closeModal(!reportBundle)
        }
        }
        />
        {!closed && (
          <ReportBundleFormModal
            currentReportBundle={currentReportBundle}
            close={() => {
              closeModal(true)
              setCurrentReportBundle(undefined)
            }}
          />
        )}
      </Resource>
    </>
  )
}

export default ReportBundleList
