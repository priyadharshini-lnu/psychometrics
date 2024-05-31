import React, { useEffect, useState } from 'react'
import { PageHeader } from '@ant-design/pro-layout'
import {
  Skeleton, Row, Col, Descriptions, InputNumber, Button,
} from 'antd'
import { useLocation, useParams } from 'react-router-dom'
import { connect, ConnectedProps } from 'react-redux'
import Report from '~/modules/reports/report'
import {
  fetchReport, getCurrent, clearUseReportDetails, FETCH_REPORT,
} from '~/modules/admin/modules/IndividualDashboard/core/userReport'
import { RootState } from '~/modules/admin/core/rootReducers'
import { isRequestInProgress } from '~/core/request'
import userPresenter from '~/presenters/user'
import styles from './styles.less'

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
  const INITIAL_SCALE = Math.max(Math.min(window.innerWidth / 1024, 1.5), 1)
  const SCALE_STEP = INITIAL_SCALE / 10
  const { campaignId } = useParams() as { campaignId: string }
  const location = useLocation()

  const params = new URLSearchParams(location.search)
  const parsedCampaignId = parseInt(campaignId, 10)
  const [scale, setScale] = useState(INITIAL_SCALE)

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


  const incrementScale = () => {
    setScale(scale => scale + SCALE_STEP)
  }

  const decrementScale = () => {
    setScale(scale => scale - SCALE_STEP)
  }
  const percentage = Math.round(scale * (1 / INITIAL_SCALE * 100))

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
          <div className={styles.reportContainer}>
            <InputNumber
              value={`${percentage} %`}
              readOnly
              width={40}
              className={styles.scaleChanger}
              addonBefore={
                <Button type="text" size="small" disabled={percentage <= 80} onClick={decrementScale}>-</Button>
              }
              addonAfter={
                <Button type="text" size="small" disabled={percentage >= 180} onClick={incrementScale}>+</Button>
              }
            />

            <div style={{ zoom: scale }} className="mt-4">
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
            </div>
          </div>
        </Col>
      </Row>
    </div>
  )
}

export const DashboardReport = connecter(DashboardReportComponent)
