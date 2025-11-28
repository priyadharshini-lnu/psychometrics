import {
  FC, useState, useEffect,
} from 'react'
import {
  connect, ConnectedProps,
} from 'react-redux'
import { message } from 'antd'
import { SkillGapReport } from '~/components/IdpShared/SkillGapReport/SkillGapReport'
import { RootState } from '~/modules/endUser/core/rootReducers'
import { FetchSkillGapsResponse } from
  '~/modules/endUser/modules/campaigns/core/idp/idpForm'
import rstore from '~/modules/reports/store'
import { setReportLoading } from '~/modules/reports/core/builder/actions'
import {
  fetchSkillGaps,
  fetchUserIdpPlan,
} from '~/modules/endUser/modules/campaigns/core/idp/userIdpPlan'

const connector = connect(
  (state: RootState) => ({
    currentUser: state.currentUser,
    skillGapReportData: state.campaigns.idp.skillGapReportData,
    skillGapReportAvailable: state.campaigns.idp.skillGapReportAvailable,
  }),
  {
    fetchSkillGaps,
    fetchUserIdpPlan,
  },
)

type PropsFromRedux = ConnectedProps<typeof connector>
type SkillGapReportProps = {
  next: () => void
  prev: () => void
  nextLabel?: string
} & PropsFromRedux

const { I18n } = window

const SkillGapReportComponent: FC<SkillGapReportProps> = ({
  next, currentUser, fetchSkillGaps, fetchUserIdpPlan, skillGapReportData, prev, nextLabel, skillGapReportAvailable,
}) => {
  const [skillGapData, setSkillGapData] = useState<FetchSkillGapsResponse | null>(null)
  const [isLoading, setLoading] = useState(false)

  useEffect(() => {
    if (!skillGapReportAvailable) {
      fetchUserIdpPlan(currentUser.id).then(({ response }) => {
        if (response.data.skillGapReportAvailable === false) {
          prev()
        }
      })
    }
    if (!skillGapReportData) {
      setLoading(true)
      fetchSkillGaps(currentUser.id, { lang: I18n.locale }).catch((error) => { message.error(error) })
        .then((data:{response:FetchSkillGapsResponse}) => {
          setSkillGapData(data.response)
        }).finally(() => {
          window.scrollTo({
            top: 0,
            left: 0,
            behavior: 'smooth',
          })
          setLoading(false)
        })
    } else {
      setSkillGapData(skillGapReportData)
    }


    return () => {
      rstore.dispatch(setReportLoading(false))
    }
  }, [])


  return (
    <SkillGapReport
      next={next}
      prev={prev}
      reportUrl={skillGapData?.report_url}
      skillGapData={skillGapData}
      isLoading={isLoading}
      nextLabel={nextLabel}
    />
  )
}

export const SkillGapReportStep = connector(SkillGapReportComponent)
