import React, { useEffect } from 'react'
import {
  Skeleton, Row, Col, PageHeader, Descriptions,
} from 'antd'
import Report from 'modules/reports/report'
import { useLocation, useParams } from 'react-router-dom'
import { connect, ConnectedProps } from 'react-redux'
import {
  fetchReport, getCurrent, clearUseReportDetails, FETCH_REPORT,
} from 'modules/admin/modules/IndividualDashboard/core/userReport'
import { RootState } from 'modules/admin/core/rootReducers'
import { isRequestInProgress } from 'core/request'
import userPresenter from 'presenters/user'

const { I18n } = window

const connecter = connect((state: RootState) => ({
  userReport: getCurrent(state),
  isReportLoadingInProgress: isRequestInProgress(state, FETCH_REPORT),
}), {
  fetchReport,
  clearUseReportDetails,
})

type PropsFromRedux = ConnectedProps<typeof connecter>
type Props = PropsFromRedux

export const DashboardReportComponent: React.FC<Props> = ({
  fetchReport, userReport, clearUseReportDetails,
}) => {
  const { campaignId } = useParams<{ campaignId: string }>()
  const location = useLocation()

  const params = new URLSearchParams(location.search)
  const parsedCampaignId = parseInt(campaignId, 10)

  useEffect(() => {
    fetchReport(parsedCampaignId, params.get('email') as string)

    return () => {
      clearUseReportDetails()
    }
  }, [])

  if (!userReport.loaded) return <Skeleton />

  const {
    report: {
      default_language: defaultLanguage,
      locales,
    }, report, results, user,
  } = userReport

  return (
    <div className="p6">
      <PageHeader
        ghost={false}
        title={userPresenter.getFullName({ firstName: user.first_name, lastName: user.last_name })}
        subTitle={user.email}
        backIcon={false}
      >
        <Descriptions size="small" column={4}>
          <Descriptions.Item label={I18n.t('profile.age')}>{user.age}</Descriptions.Item>
          <Descriptions.Item label={I18n.t('profile.gender')}>{user.gender}</Descriptions.Item>
          <Descriptions.Item label={I18n.t('profile.locale')}>{user.locale}</Descriptions.Item>
          {user.custom_fields.map(field => (
            <Descriptions.Item label={field.name}>{field.value}</Descriptions.Item>
          ))}
        </Descriptions>
      </PageHeader>
      <Row gutter={[0, 16]} justify="center">
        <Col>
          <Report
            data={report}
            results={results}
            campaign={JSON.stringify({})}
            user={JSON.stringify(user)}
            locales={locales}
            selectedLocale={defaultLanguage}
            userReport={userReport}
            dashboard
          />
        </Col>
      </Row>
    </div>
  )
}

export const DashboardReport = connecter(DashboardReportComponent)
