import {
  FC, useState, useEffect,
} from 'react'
import { connect, ConnectedProps } from 'react-redux'
import {
  useParams,
} from 'react-router-dom'
import { SkillGapReportContent } from '~/components/IdpShared/SkillGapReport/SkillGapReportContent'
import {
  fetchSingle as fetchReport,
} from '~/modules/admin/modules/campaigns/core/userReports'
import { FetchSkillGapsResponse } from '~/modules/admin/modules/campaigns/core/UserIdpPlan'

const connector = connect(() => ({
}), {
  fetchReport,
})

type PropsFromRedux = ConnectedProps<typeof connector>

type SkillGapReportWrapperProps = {
  skillGapReportId: number
} & PropsFromRedux


const { I18n } = window

const SkillGapReportTabComponent: FC<SkillGapReportWrapperProps> = ({
  skillGapReportId, fetchReport,
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
    <SkillGapReportContent skillGapData={skillGapData} isLoading={isLoading} />
  )
}

export const SkillGapReportTab = connector(SkillGapReportTabComponent)
