import { FC, useEffect } from 'react'
import { connect, ConnectedProps } from 'react-redux'
import {
  Button, Skeleton,
} from 'antd'
import { useParams } from 'react-router-dom'
import { ReloadOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import { useReportDimensions } from '~/hooks/useReportDimensions'
import styles from './styles.less'
import { RootState } from '~/modules/admin/core/rootReducers'
import {
  fetchSingle as fetchReport, getCurrent,
} from '~/modules/admin/modules/AssessorApp/core/userReports'
import Report from '~/modules/reports/report'

const { I18n } = window

const connector = connect((state: RootState) => ({
  scoreModerate: state.assessors.scoreModerate,
  userReport: getCurrent(state),
}), {
  fetchReport,
})

interface Props extends ConnectedProps<typeof connector> {
  reportId?: number
}

export const MainReportComponent: FC<Props> = ({ userReport, reportId, fetchReport }) => {
  const { campaignId } = useParams() as { id: string, campaignId: string }
  const parsedCampaignId = parseInt(campaignId, 10)

  useEffect(() => {
    fetch()
  }, [])

  const fetch = () => {
    if (reportId) {
      fetchReport(parsedCampaignId, reportId)
    }
  }

  const {
    containerRef, reportRef, scale, reportSize,
  } = useReportDimensions()

  const reportIsLoaded = (): boolean | undefined => (userReport && userReport.loaded)

  const renderReportPreview = () => {
    const {
      report: {
        default_language: defaultLanguage,
        locales,
      }, report, results, user,
    } = userReport

    return (
      <Report
        key="report"
        data={report}
        results={results}
        campaign={JSON.stringify({})}
        user={JSON.stringify(user)}
        locales={locales}
        selectedLocale={defaultLanguage}
        userReport={userReport}
      />
    )
  }

  return (
    <div className={styles.mainReport}>
      {!reportIsLoaded()
        ? <Skeleton key="skeleton" active /> : (
          <>
            <Button onClick={fetch} icon={<ReloadOutlined />}>
              {I18n.t('admin.refresh')}
            </Button>
            <div ref={containerRef} className={styles.reportOuter} style={{ height: reportSize.height || 'auto' }}>
              <div ref={reportRef} className={styles.reportInner} style={{ transform: `scale(${scale})` }}>
                {renderReportPreview()}
              </div>
            </div>
          </>
        )}
    </div>
  )
}


export const MainReport = connector(MainReportComponent)
