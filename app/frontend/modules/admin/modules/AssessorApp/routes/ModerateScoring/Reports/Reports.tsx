import { FC, useEffect } from 'react'
import { connect, ConnectedProps } from 'react-redux'
import {
  Space, Card, Button, Image, Tabs, Skeleton,
} from 'antd'
import { EyeFilled } from '@ant-design/icons'
import { useParams } from 'react-router-dom'
import { Tab } from 'rc-tabs/lib/interface'
import styles from './styles.less'
import { RootState } from '~/modules/admin/core/rootReducers'
import bg from '~/modules/endUser/modules/campaigns/routes/Insights/media/Background2.png'
import { MainReport } from './MainReport'
import { fetchReports, FETCH_REPORTS } from '../../../core/scoreModerate'
import { isRequestInProgress } from '~/core/request'

const { I18n } = window

const connector = connect((state: RootState) => ({
  scoreModerate: state.assessors.scoreModerate,
  loading: isRequestInProgress(state, FETCH_REPORTS),
}), {
  fetchReports,
})

interface Props extends ConnectedProps<typeof connector> {
  header: (title:string, withoutBorder: boolean) => React.ReactNode
}

export const ReportsComponent: FC<Props> = ({
  fetchReports, scoreModerate: { userReports, mainReportId }, header,
}) => {
  let parsedCampaignId
  let parsedUserId

  const { campaignId, userId } = useParams<{ campaignId?: string, userId?: string }>()
  if (campaignId) { parsedCampaignId = parseInt(campaignId, 10) }
  if (userId) { parsedUserId = parseInt(userId, 10) }

  useEffect(() => {
    if (!userReports) {
      fetchReports(parsedCampaignId, parsedUserId)
    }
  }, [])


  if (!userReports) {
    return (
      <div className={styles.sidebar}>
        <Skeleton active />
      </div>
    )
  }

  const reportPreviewUrl = (report) => {
    if (report.external_report) {
      return `/assessors/campaigns/${report.campaign_id}/external_user_report/${report.id}`
    }
    return `/assessors/campaigns/${report.campaign_id}/user_reports/${report.id}`
  }


  let items: Tab[] = [
    {
      key: 'others',
      label: I18n.t('administration.assessor.moderate_score.other_reports'),
      children: (
        <>
          <div className={styles.count}>
            {I18n.t('administration.assessor.moderate_score.reports_count',
              { count: userReports.length })}
          </div>
          <Space direction="vertical" size={8} style={{ width: '100%' }}>
            {userReports.map(report => (
              <Card
                bodyStyle={{
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: 12,
                }}
                className={styles.card}
                bordered={false}
              >
                <div className={styles.cardContent}>
                  <Space>
                    <Image className={styles.img} width={60} preview={false} src={report.poster || bg} />
                    {report.name}
                  </Space>
                  <Button
                    type="link"
                    icon={<EyeFilled style={{ fontSize: 22 }} />}
                    href={reportPreviewUrl(report)}
                    target="_blank"
                  />
                </div>
              </Card>
            ))}
          </Space>
        </>),
    },
  ]
  if (mainReportId) {
    items = [{
      key: 'main',
      label: I18n.t('administration.assessor.moderate_score.main_report'),
      children: <MainReport reportId={mainReportId} />,
    }, ...items]
  }

  return (
    <div className={styles.sidebar}>
      {header(I18n.t('administration.assessor.moderate_score.reports'), true)}
      <div>
        <Tabs
          tabBarStyle={{ padding: '0 12px', margin: 0 }}
          defaultActiveKey="main"
          items={items}
        />
      </div>
    </div>
  )
}

export const Reports = connector(ReportsComponent)
