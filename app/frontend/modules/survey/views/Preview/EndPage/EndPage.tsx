import React, { FC } from 'react'
import { connect, ConnectedProps } from 'react-redux'

import { RootState } from 'modules/survey/core/rootReducers'
import { getI18n } from 'core/preview/FlowProcessor/selectors'

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
}))

type PropsFromRedux = ConnectedProps<typeof connector>

interface OwnProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  flowElement: any
}

type Props = OwnProps & PropsFromRedux

const EndPage: FC<Props> = ({
  isAnonymousAssessment,
  dashboardUrl,
  dbResult,
  I18n,
  scoring,
  factors,
  showScoringOnEndPage,
  flowElement,
}) => {
  const { user_assessment_id } = dbResult

  let message = I18n.t('assessments.messages.finish')
  if (flowElement && flowElement.type === 'EndOfAssessment') {
    if (flowElement.props.messageType === 'Custom') {
      message = flowElement?.props?.message
    }
  }
  const textDirection = message.match(/[A-Za-z]+(?:\|;|\.|!|\?|:)/) !== null ? 'ltr' : 'rtl'

  return (
    <div className={styles.page}>
      <div className={styles.logo}>{/* <img src={Logo} /> */}</div>
      <div className={styles.end} style={{ direction: textDirection }}>
        {message}
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
      <UniqueID flowElement={flowElement} dbResult={dbResult} />
    </div>
  )
}

interface UniqueIDProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  flowElement: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dbResult: any
}

const UniqueID: FC<UniqueIDProps> = ({ flowElement, dbResult }) => {
  const hashID = dbResult?.hash_id ?? '<it is builder>'

  if (flowElement && flowElement.type === 'EndOfAssessment') {
    if (flowElement.props.showUniqueId) {
      return (
        <div className={styles.end}>
          Your unique ID:
          {hashID}
        </div>
      )
    }
  }
  return null
}

export default connector(EndPage)
