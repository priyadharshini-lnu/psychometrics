import { FC, useEffect } from 'react'
import { connect, ConnectedProps } from 'react-redux'

import { useLocation, useNavigate, useParams } from 'react-router-dom'
import {
  Space, Typography, Alert, Spin,
} from 'antd'
import { Loading3QuartersOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import { RootState } from '~/modules/survey/core/rootReducers'

import { EndOfAssessmentElementProps } from '~/modules/survey/core/preview/FlowProcessor/interfaces'
import { getI18n } from '~/modules/survey/core/preview/FlowProcessor/selectors'

import ScoringTable from './components/ScoringTable'

import styles from './styles.less'
import { SafeHTML } from '~/components/SafeHTML'

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
  assessmentId: preview.id,
  invalidSession: preview.invalidSession,
  extra: preview.extraOptions,
}))

type OwnProps = {
  insideSelectiveProctoringSession?: boolean
}

type PropsFromRedux = ConnectedProps<typeof connector>

type Props = PropsFromRedux & OwnProps

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
  assessmentId,
  invalidSession,
  extra,
  insideSelectiveProctoringSession,
}) => {
  const location = useLocation()
  const navigate = useNavigate()
  const { userAssessmentId } = useParams() as { userAssessmentId: string }

  const parsedUserAssessmentId = parseInt(userAssessmentId, 10)

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    params.delete('read')
    params.delete('edit')
    navigate(`?${params.toString()}`, { replace: true })
  }, [])

  const { user_assessment_id } = dbResult

  let message = I18n.t('assessments.messages.finish', { locale: I18n.uiLocale })
  if (endOfAssessmentElementProps?.messageType === 'Custom' && endOfAssessmentElementProps?.message) {
    message = endOfAssessmentElementProps?.message
  }
  const getViewPath = () => `?tab=${assessmentId}&read=true`

  if (insideSelectiveProctoringSession) {
    return (
      <div className="w-100 h-100vh flex ta-c items-center justify-center">
        <Space orientation="vertical" align="center">
          <Spin indicator={<Loading3QuartersOutlined style={{ fontSize: 48 }} />} />
          <Typography.Text>
            <SafeHTML className="fs-20" html={I18n.t('shared.ending_proctoring_session_msg')} />
          </Typography.Text>
        </Space>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <div className={styles.logo}>{/* <img src={Logo} /> */}</div>
      <div className={styles.end}>
        {invalidSession ? (
          <Space orientation="vertical">
            <Alert
              style={{ textAlign: 'initial' }}
              message={I18n.t('assessments.page.invalid_session.title')}
              description={I18n.t('assessments.page.invalid_session.description')}
              type="error"
              showIcon
            />
            {!isAnonymousAssessment && (
              <a href={dashboardUrl}>
                {I18n.t('assessments.actions.back_to_dashboard', { locale: I18n.uiLocale })}
              </a>
            )}
          </Space>
        ) : (
          <Space orientation="vertical" align="center">
            {!showScoringOnEndPage && !isAnonymousAssessment && !extra.disable_continue_to_dashboard && (
              <>
                {otherPendingAssessmentCount > 0 && (
                  <Typography.Title className="fs-20" level={2}>
                    {I18n.t('assessments.actions.pending_tasks',
                      { count: otherPendingAssessmentCount, locale: I18n.uiLocale })
                 }
                  </Typography.Title>
                )}
                <a href={`${dashboardUrl}?user_assessment_id=${parsedUserAssessmentId}`}>
                  {I18n.t('assessments.actions.goto_dashboard', { locale: I18n.uiLocale })}
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
                  {I18n.t('assessments.actions.submit_another_response', { locale: I18n.uiLocale })}
                </a>
              </form>
            )}
            <Typography.Text>
              {message}
              <UniqueID endOfAssessmentElementProps={endOfAssessmentElementProps} dbResult={dbResult} />
            </Typography.Text>
          </Space>
        )}
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
              {I18n.t('campaign.edit_evaluation.view', { locale: I18n.uiLocale })}
            </a>
            {' | '}
            <a href={dashboardUrl}>
              {I18n.t('assessments.actions.back_to_campaign', { locale: I18n.uiLocale })}
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
