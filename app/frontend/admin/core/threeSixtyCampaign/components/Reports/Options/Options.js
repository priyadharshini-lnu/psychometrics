import React, { useEffect } from 'react'
import AccessSection from './AccessSection'
import ApprovalSection from './ApprovalSection'
import ReportAvailabilitySection from './ReportAvailabilitySection'
import css from './style.scss'

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
    <div className={css.container}>
      <AccessSection />
      <ApprovalSection />
      <ReportAvailabilitySection />
    </div>
  )
}
