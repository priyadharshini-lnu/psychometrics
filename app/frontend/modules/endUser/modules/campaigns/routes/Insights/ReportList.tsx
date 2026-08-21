import {
  FC, useContext, useState,
} from 'react'
import { connect, ConnectedProps } from 'react-redux'
import {
  Row, Col, Layout, Skeleton, Button, Flex, Tooltip, Modal,
  Typography,
} from 'antd'
import _ from 'lodash'
import cs from 'classnames'
import { DownloadOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import { getLocalizedLanguageName } from '~/utils/locales'
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
  const [openDownloadModal, setOpenDownloadModal] = useState(false)
  const [selectedReport, setSelectedReport] = useState(null)
  if (!userReports) {
    return (
      <Skeleton active />
    )
  }
  const { isMobile } = useContext(MediaQueryContext)

  const handleOpenReportDownloadModal = (report) => {
    setSelectedReport(report)
    setOpenDownloadModal(true)
  }

  const handleCloseDownloadModal = () => {
    setOpenDownloadModal(false)
    setSelectedReport(null)
  }

  const pdfUrls = (report) => {
    if (report.pdfUrls) {
      return Object.values(report.pdfUrls)
    }
    return []
  }

  const reportLink = (report) => {
    if (report.status === 'prepared') {
      const urls = pdfUrls(report)
      const haveSingleReport = urls.length === 1
      if (haveSingleReport) {
        return <a target="_blank" href={report.pdfUrl} rel="noreferrer">{I18n.t('common.text.download')}</a>
      } if (urls.length > 1) {
        return (
          <Button
            type="link"
            onClick={() => handleOpenReportDownloadModal(report)}
          >
            {I18n.t('common.text.download')}
          </Button>
        )
      }
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
              {isMobile && pdfUrls(report).length === 1 ? (
                <Button target="_blank" href={report.pdfUrl} type="link" disabled={report.status !== 'prepared'}>
                  <DownloadOutlined />
                </Button>
              ) : null}
              {isMobile && pdfUrls(report).length > 1 ? (
                <Button
                  type="link"
                  disabled={report.status !== 'prepared'
                    || !report.pdfUrl}
                  onClick={() => handleOpenReportDownloadModal(report)}
                >
                  <DownloadOutlined />
                </Button>
              ) : null}
            </div>
          </Col>
        ))}
      </Row>
      {openDownloadModal && (
        <DownloadReportInMultipleLocales
          close={handleCloseDownloadModal}
          report={selectedReport}
        />
      )}
    </Content>
  )
}

export const ReportList = connector(ReportListComponent)


const DownloadReportInMultipleLocales = ({ report, close }) => {
  const { posterUrl, pdfUrls, reportName } = report
  const locales = Object.keys(pdfUrls)
  const formattedLocale = (locale: string) => locale.replace(/([a-z]{2})([A-Z]\w+)/, '$1-$2')

  return (
    <Modal
      width={650}
      title={(
        <Flex vertical>
          <Typography.Title level={4} className="m-0">
            {I18n.t('campaign_assessment.actions.download')}
          </Typography.Title>
          <Typography.Text>
            {reportName}
          </Typography.Text>
        </Flex>
        )}
      open
      onCancel={close}
      footer=""
    >
      <Row>
        {locales.map((locale) => {
          const downloadUrl = pdfUrls[locale]

          return (
            <Col
              key={locale}
              xs={{ span: 12 }}
              sm={{ span: 12 }}
              md={{ span: 8 }}
              xl={{ span: 6 }}
              xxl={{ span: 6 }}
              className={styles.downloadItem}
            >
              <Flex
                key={locale}
                vertical
                style={{
                  textAlign: 'center',
                  minHeight: '180px',
                }}
                justify="center"
                align="center"
              >
                {posterUrl ? (
                  <img src={posterUrl} alt={`Report for ${locale}`} width={100} height={100} />
                ) : (
                  <img src={bg} alt={`Report for ${locale}`} width={100} height={100} />
                )}
                <Typography.Text style={{ marginTop: '8px' }}>
                  {getLocalizedLanguageName(formattedLocale(locale))}
                </Typography.Text>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault()
                    window.open(downloadUrl, '_blank')
                  }}
                >
                  {I18n.t('user_reports.actions.download')}
                </a>
              </Flex>
            </Col>
          )
        })}
      </Row>
    </Modal>
  )
}
