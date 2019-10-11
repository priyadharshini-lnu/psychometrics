import React, { useEffect } from 'react'
import AccessSection from './AccessSection'
import ApprovalSection from './ApprovalSection'
import ReportAvailabilitySection from './ReportAvailabilitySection'
import styles from './styles.scss'

export default function Options ({
  fetchReportOptions,
  match: {
    params: { campaignId },
  },
}) {
  useEffect(() => {
    fetchReportOptions(campaignId)
  }, [])

  return (
    <div className={styles.container}>
      <AccessSection />
      <ApprovalSection />
      <ReportAvailabilitySection />
    </div>
  )
}
