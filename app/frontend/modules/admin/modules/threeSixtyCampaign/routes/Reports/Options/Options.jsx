import { useEffect } from 'react'
import AccessSection from './AccessSection'
import ApprovalSection from './ApprovalSection'
import ReportAvailabilitySection from './ReportAvailabilitySection'
import styles from './styles.less'

export default function Options ({
  fetchReportOptions,
  campaignReportPermissions,
  match: {
    params: { campaignId },
  },
}) {
  useEffect(() => {
    fetchReportOptions(campaignId)
  }, [])

  return (
    <div className={styles.container}>
      <>
        <AccessSection manageReportsOptions={campaignReportPermissions.manageReportsOptions} />
        <ApprovalSection />
        <ReportAvailabilitySection />
      </>
    </div>
  )
}
