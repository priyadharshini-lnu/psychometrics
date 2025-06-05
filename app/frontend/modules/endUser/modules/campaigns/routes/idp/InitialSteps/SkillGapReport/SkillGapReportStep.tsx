import {
  FC, useState, useEffect,
} from 'react'
import { connect, ConnectedProps } from 'react-redux'
import { SkillGapReport } from '~/components/IdpShared/SkillGapReport/SkillGapReport'
import styles from '~/components/IdpShared/SkillGapReport/SkillGapReport.less'
import { RootState } from '~/modules/endUser/core/rootReducers'
import { fetchSkillGaps, FetchSkillGapsResponse } from '~/modules/endUser/modules/campaigns/core/idp/idpForm'
import rstore from '~/modules/reports/store'
import { setReportLoading } from '~/modules/reports/core/builder/actions'

const connector = connect(
  (state: RootState) => ({
    currentUser: state.currentUser,
  }),
  {
    fetchSkillGaps,
  },
)

type PropsFromRedux = ConnectedProps<typeof connector>
type SkillGapReportProps = {
  next: () => void
} & PropsFromRedux

const { I18n } = window

const SkillGapReportComponent: FC<SkillGapReportProps> = ({ next, currentUser, fetchSkillGaps }) => {
  const [skillGapData, setSkillGapData] = useState<FetchSkillGapsResponse | null>(null)
  const [isLoading, setLoading] = useState(true)

  useEffect(() => {
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

    return () => {
      rstore.dispatch(setReportLoading(false))
    }
  }, [])


  return (
    <SkillGapReport
      next={next}
      reportUrl={skillGapData?.report_url}
      skillGapData={skillGapData}
      isLoading={isLoading}
      styles={{
        reportContainer: styles.reportContainer,
        reportViewer: styles.reportViewer,
      }}
    />
  )
}

export const SkillGapReportStep = connector(SkillGapReportComponent)
