import _ from 'lodash'
import {
  FC, useState, useEffect,
} from 'react'

import { connect, ConnectedProps } from 'react-redux'
import { RootState } from '~/modules/endUser/core/rootReducers'
import { fetchSkillGaps, FetchSkillGapsResponse } from '~/modules/endUser/modules/campaigns/core/idp/idpForm'
import { SkillGapReportStep } from '~/components/IdpShared/InitialSteps/SkillGapReportStep'

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


const SkillGapReportComponent: FC<SkillGapReportProps> = ({ next, currentUser, fetchSkillGaps }) => {
  const [skillGapData, setSkillGapData] = useState<FetchSkillGapsResponse|null>(null)

  // group by category
  const groupedSkillGaps = _.groupBy(skillGapData?.idpTemplateSkills, 'category')
  const allFields = skillGapData?.datasheetFields.concat(skillGapData?.profileFields)

  useEffect(() => {
    fetchSkillGaps(currentUser.id).then((data) => {
      setSkillGapData(data.response)
    })
  }, [])

  return (
    <SkillGapReportStep
      next={next}
      currentUser={currentUser}
      skillGapData={groupedSkillGaps}
      fields={allFields || []}
    />
  )
}

export const SkillGapReport = connector(SkillGapReportComponent)
