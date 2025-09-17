import {
  FC, useState, useEffect,
} from 'react'
import { connect, ConnectedProps } from 'react-redux'
import { SkillGapReportContent } from '~/components/IdpShared/SkillGapReport/SkillGapReportContent'
import { RootState } from '~/modules/endUser/core/rootReducers'
import { FetchSkillGapsResponse } from
  '~/modules/endUser/modules/campaigns/core/idp/idpForm'
import { fetchSkillGaps } from '~/modules/endUser/modules/campaigns/core/idp/userIdpPlan'
import rstore from '~/modules/reports/store'
import { setReportLoading } from '~/modules/reports/core/builder/actions'

const connector = connect(
  (state: RootState) => ({
    currentUser: state.currentUser,
    skillGapReportData: state.campaigns.idp.skillGapReportData,
  }),
  {
    fetchSkillGaps,
  },
)

type PropsFromRedux = ConnectedProps<typeof connector>
type SkillGapReportProps = PropsFromRedux

const { I18n } = window

const SkillGapReportTabComponent: FC<SkillGapReportProps> = ({
  currentUser, fetchSkillGaps, skillGapReportData,
}) => {
  const [skillGapData, setSkillGapData] = useState<FetchSkillGapsResponse | null>(null)
  const [isLoading, setLoading] = useState(true)

  useEffect(() => {
    if (!skillGapReportData) {
      fetchSkillGaps(currentUser.id, { lang: I18n.locale }).then((data) => {
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
      setLoading(false)
    }

    return () => {
      rstore.dispatch(setReportLoading(false))
    }
  }, [])


  return (
    <SkillGapReportContent
      skillGapData={skillGapData}
      isLoading={isLoading}
    />
  )
}

export const SkillGapReportTab = connector(SkillGapReportTabComponent)
