import React, { useEffect } from 'react'
import AccessSection from './AccessSection'
import css from './style'

export default function Options ({
  fetchReportOptions,
  match: {
    params: { campaignId },
  }
}) {
  useEffect(() => {
    fetchReportOptions(campaignId)
  }, [])

  return (
    <div className={css.container}>
      <AccessSection />
    </div>
  )
}
