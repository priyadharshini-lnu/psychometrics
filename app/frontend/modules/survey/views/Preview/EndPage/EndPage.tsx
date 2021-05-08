import React, { FC } from 'react'
import { connect, ConnectedProps } from 'react-redux'

import { RootState } from 'modules/survey/core/rootReducers'
import { getI18n } from 'core/preview/FlowProcessor/selectors'

import { EndOfAssessmentElementProps } from 'modules/survey/core/preview/FlowProcessor/interfaces'
import ScoringTable from './components/ScoringTable'

import styles from './styles.scss'

const connector = connect(({ preview }: RootState) => ({
  isAnonymousAssessment: preview.isAnonymousAssessment,
  dashboardUrl: preview.dashboardUrl,
  dbResult: preview.dbResult,
  I18n: getI18n(preview),
  scoring: preview.scoring,
  factors: preview.factors,
  showScoringOnEndPage: preview.showScoringOnEndPage,
  endOfAssessmentElementProps: preview.endOfAssessmentElementProps as EndOfAssessmentElementProps | undefined,
}))

type PropsFromRedux = ConnectedProps<typeof connector>

type Props = PropsFromRedux

const EndPage: FC<Props> = ({
  isAnonymousAssessment,
  dashboardUrl,
  dbResult,
  I18n,
  scoring,
  factors,
  showScoringOnEndPage,
  endOfAssessmentElementProps,
}) => {
  const { user_assessment_id } = dbResult

  let message = I18n.t('assessments.messages.finish')
  if (endOfAssessmentElementProps?.messageType === 'Custom' && endOfAssessmentElementProps?.message) {
    message = endOfAssessmentElementProps?.message
  }
  const textDirection = message.match(/[A-Za-z]+(?:\|;|\.|!|\?|:)/) !== null ? 'ltr' : 'rtl'

  return (
    <div className={styles.page}>
      <div className={styles.logo}>{/* <img src={Logo} /> */}</div>
      <div className={styles.end} style={{ direction: textDirection }}>
        {message}
        <UniqueID endOfAssessmentElementProps={endOfAssessmentElementProps} dbResult={dbResult} />
      </div>
      <ScoringTable
        showScoringOnEndPage={showScoringOnEndPage}
        scoring={scoring}
        factors={factors}
        dashboardUrl={dashboardUrl}
        I18n={I18n}
        userAssessmentId={user_assessment_id}
      />
      {!showScoringOnEndPage && !isAnonymousAssessment && (
        <div className={styles.end}>
          <a href={dashboardUrl}>
            {I18n.t('assessments.actions.goto_dashboard')}
          </a>
        </div>
      )}
    </div>
  )
}

interface UniqueIDProps {
  endOfAssessmentElementProps: EndOfAssessmentElementProps | undefined
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dbResult: any
}

const UniqueID: FC<UniqueIDProps> = ({ endOfAssessmentElementProps, dbResult }) => {
  const hashID = dbResult?.hash_id

  if (endOfAssessmentElementProps?.showUniqueId && hashID) {
    return (
      <div>
        Your unique ID:
        {hashID}
      </div>
    )
  }
  return null
}

export default connector(EndPage)
