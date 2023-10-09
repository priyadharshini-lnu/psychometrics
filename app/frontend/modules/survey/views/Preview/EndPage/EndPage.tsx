import { FC, useEffect } from 'react'
import { connect, ConnectedProps } from 'react-redux'

import { useLocation, useHistory, useParams } from 'react-router-dom'
import { Space, Typography } from 'antd'
import { RootState } from '~/modules/survey/core/rootReducers'

import { EndOfAssessmentElementProps } from '~/modules/survey/core/preview/FlowProcessor/interfaces'
import { getI18n } from '~/modules/survey/core/preview/FlowProcessor/selectors'

import ScoringTable from './components/ScoringTable'

import styles from './styles.less'

const connector = connect(({ preview }: RootState) => ({
  isAnonymousAssessment: preview.isAnonymousAssessment,
  allowMultipleResponses: preview.allowMultipleResponses,
  dashboardUrl: preview.dashboardUrl,
  dbResult: preview.dbResult,
  I18n: getI18n(preview),
  scoring: preview.scoring,
  factors: preview.factors,
  showScoringOnEndPage: preview.showScoringOnEndPage,
  endOfAssessmentElementProps: preview.endOfAssessmentElementProps as EndOfAssessmentElementProps | undefined,
  nextAssessmentUrl: preview.nextAssessmentUrl,
  otherPendingAssessmentCount: preview.otherPendingAssessmentCount,
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
  // nextAssessmentUrl,
  otherPendingAssessmentCount,
  allowMultipleResponses,
}) => {
  const location = useLocation()
  const history = useHistory()
  const { userAssessmentId } = useParams<{ userAssessmentId: string }>()

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    params.delete('read')
    params.delete('edit')
    history.replace(`${location.pathname}?${params.toString()}`)
  }, [])

  const { user_assessment_id } = dbResult

  let message = I18n.t('assessments.messages.finish')
  if (endOfAssessmentElementProps?.messageType === 'Custom' && endOfAssessmentElementProps?.message) {
    message = endOfAssessmentElementProps?.message
  }

  const getViewPath = () => `?tab=${user_assessment_id}&read=true`

  return (
    <div className={styles.page}>
      <div className={styles.logo}>{/* <img src={Logo} /> */}</div>
      <div className={styles.end}>
        <Space direction="vertical" align="center">
          <Typography.Text>
            {message}
            <UniqueID endOfAssessmentElementProps={endOfAssessmentElementProps} dbResult={dbResult} />
          </Typography.Text>
          {!showScoringOnEndPage && !isAnonymousAssessment && (
            <>
              {otherPendingAssessmentCount > 0 && (
              <Typography.Title level={3}>
                {I18n.t('assessments.actions.pending_tasks', { count: otherPendingAssessmentCount })}
              </Typography.Title>
              )}
              <a href={`${dashboardUrl}?user_assessment_id=${userAssessmentId}`}>
                {I18n.t('assessments.actions.goto_dashboard')}
              </a>
            </>
          )}
          {isAnonymousAssessment && allowMultipleResponses && (
            <form method="post" action={location.pathname}>
              <input type="hidden" name="_method" value="DELETE" />
              <input
                type="hidden"
                name="authenticity_token"
                value={document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') as string}
              />
              <a href="#" onClick={e => (e.currentTarget.parentNode as HTMLFormElement).submit()}>
                {I18n.t('assessments.actions.submit_another_response')}
              </a>
            </form>
          )}
        </Space>
      </div>
      <ScoringTable
        showScoringOnEndPage={showScoringOnEndPage}
        scoring={scoring}
        factors={factors}
        I18n={I18n}
        userAssessmentId={user_assessment_id}
      />
      {/* {nextAssessmentUrl && (
        <>
          <div className={styles.links}>
            <a href={nextAssessmentUrl}>
              {I18n.t('assessments.actions.next_assessment')}
            </a>
          </div>
        </>
      )} */}
      {showScoringOnEndPage && (
        <>
          <div className={styles.links}>

            <a href={getViewPath()}>
              {I18n.t('campaign.edit_evaluation.view')}
            </a>
            {' | '}
            <a href={dashboardUrl}>
              {I18n.t('assessments.actions.back_to_campaign')}
            </a>
          </div>
        </>
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
      <Typography.Paragraph>
        <Space>
          Your unique ID:
          <Typography.Text code copyable>{hashID}</Typography.Text>
        </Space>
      </Typography.Paragraph>
    )
  }
  return null
}

export default connector(EndPage)
