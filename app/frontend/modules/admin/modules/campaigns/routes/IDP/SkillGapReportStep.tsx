import { FC, useEffect, useState } from 'react'
import {
  useParams,
} from 'react-router-dom'
import { connect, ConnectedProps } from 'react-redux'
import {
  fetchSingle as fetchReport,
} from '~/modules/admin/modules/campaigns/core/userReports'
import { SkillGapReport } from '~/components/IdpShared/SkillGapReport/SkillGapReport'
import { FetchSkillGapsResponse } from '~/modules/admin/modules/campaigns/core/UserIdpPlan'

const { I18n } = window

const connector = connect(() => ({
}), {
  fetchReport,
})

type PropsFromRedux = ConnectedProps<typeof connector>

type SkillGapReportWrapperProps = {
  next: () => void
  skillGapReportId: number
  prev: () => void
  nextLabel?: string
} & PropsFromRedux

const SkillGapReportWrapper:FC<SkillGapReportWrapperProps> = ({
  fetchReport,
  skillGapReportId,
  next,
  prev,
  nextLabel,
}) => {
  const { campaignId } = useParams()

  const [skillGapData, setSkillGapData] = useState<FetchSkillGapsResponse | null>(null)

  const [isLoading, setLoading] = useState(true)

  useEffect(() => {
    if (skillGapReportId) {
      fetchReport(Number(campaignId), skillGapReportId, { lang: I18n.locale }).then((data) => {
        setSkillGapData(data.response as FetchSkillGapsResponse)
      }).finally(() => {
        window.scrollTo({
          top: 0,
          left: 0,
          behavior: 'smooth',
        })
        setLoading(false)
      })
    }
  }, [skillGapReportId])


  return (
    <SkillGapReport
      next={next}
      prev={prev}
      reportUrl={skillGapData?.pdf.url}
      skillGapData={skillGapData}
      isLoading={isLoading}
      nextLabel={nextLabel}
    />
  )
}

export const SkillGapReportStep = connector(SkillGapReportWrapper)
