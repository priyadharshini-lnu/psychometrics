import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import AccessSection from './AccessSection'
import ApprovalSection from './ApprovalSection'
import ReportAvailabilitySection from './ReportAvailabilitySection'
import ReportLanguageSection from './ReportLanguageSection'
import styles from './styles.less'

export default function Options ({
  fetchReportOptions,
  campaignReportPermissions,
}) {
  const { campaignId } = useParams()
  useEffect(() => {
    fetchReportOptions(campaignId)
  }, [])

  return (
    <div className={styles.container}>
      <>
        <AccessSection manageReportsOptions={campaignReportPermissions.manageReportsOptions} />
        <ApprovalSection />
        <ReportAvailabilitySection />
        <ReportLanguageSection />
      </>
    </div>
  )
}
