import { FC, useContext } from 'react'
import { connect, ConnectedProps } from 'react-redux'
import {
  Row, Col, Layout, Skeleton, Button, Tooltip,
} from 'antd'
import _ from 'lodash'
import cs from 'classnames'
import { DownloadOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import { RootState } from '~/modules/endUser/core/rootReducers'
import { MediaQueryContext } from '~/glint'
import bg from './media/Background2.png'
import styles from './ReportList.less'

const { I18n } = window
const { Content } = Layout

const connector = connect(
  (state: RootState) => ({
    userReports: state.campaigns.campaign.userReports,
  }),
  {},
)

type ComponentProps = ConnectedProps<typeof connector>

const ReportListComponent: FC<ComponentProps> = ({ userReports }) => {
  if (!userReports) {
    return (
      <Skeleton active />
    )
  }
  const { isMobile } = useContext(MediaQueryContext)

  const reportLink = (report) => {
    if (report.status === 'prepared') {
      return <a target="_blank" href={report.pdfUrl} rel="noreferrer">{I18n.t('common.text.download')}</a>
    }
    return I18n.t(`user_reports.statuses.${report.status}`)
  }

  return (
    <Content className={styles.reports}>
      <Row gutter={[14, 14]}>
        {_.map(userReports, report => (
          <Col
            className={styles.card}
            xs={{ span: 24 }}
            sm={{ span: 12 }}
            md={{ span: 8 }}
            xl={{ span: 4 }}
            xxl={{ span: 4 }}
            key={report.id}
          >
            <div className={styles.cover}>
              <img src={report.posterUrl || bg} />
              <div className={styles.title}>
                <div className={styles.name}>
                  <Tooltip title={report.reportName}>{report.reportName}</Tooltip>
                </div>
                <div className={cs(styles.status, styles[report.status])}>
                  {isMobile
                    ? I18n.t(`user_reports.statuses.${report.status}`)
                    : reportLink(report)}
                </div>
              </div>
              {isMobile && (
                <Button target="_blank" href={report.pdfUrl} type="link" disabled={report.status !== 'prepared'}>
                  <DownloadOutlined />
                </Button>
              )}
            </div>
          </Col>
        ))}
      </Row>
    </Content>
  )
}

export const ReportList = connector(ReportListComponent)
