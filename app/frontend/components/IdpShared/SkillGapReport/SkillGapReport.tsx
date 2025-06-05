import {
  Typography,
  Row, Col, Button, Spin, Flex, Layout,
} from 'antd'
import { PageHeader } from '@ant-design/pro-layout'
import { DownloadOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import {
  ButtonWithArrow,
} from '~/glint'
import Report from '~/modules/reports/report'

const { Content } = Layout

const { I18n } = window

export const SkillGapReport = ({
  next, skillGapData, reportUrl, isLoading, styles,
}) => {
  const extraContent = (isLoading ? <></>
    : (
      reportUrl && (
        <Flex className="mt-2">
          <Button
            key="download"
            icon={<DownloadOutlined />}
            disabled={skillGapData?.status !== 'prepared'}
            href={reportUrl}
            target="_blank"
          >
            {I18n.t('common.text.download')}
          </Button>
        </Flex>
      )
    )
  )

  return (
    <>
      <Content className={styles.reportContainer}>
        {
          isLoading ? (
            <Row style={{ height: '80vh' }} justify="center" align="middle">
              <Col>
                <Spin size="large" />
              </Col>
            </Row>
          ) : (
            <>
              {skillGapData && (
                <>
                  <PageHeader
                    className={!isLoading ? styles.reportHeader : ''}
                    ghost={false}
                    title={(
                      <Typography.Title level={4}>{I18n.t('idp.skill_gap_report.title')}</Typography.Title>
                )}
                    extra={extraContent}
                  />
                  <Flex justify="center" className={`${styles.reportViewer} mb-5"`}>
                    <Report
                      data={skillGapData.report}
                      results={skillGapData.results}
                      campaign={JSON.stringify({})}
                      user={JSON.stringify(skillGapData.user)}
                      locales={skillGapData.report.locales}
                      selectedLocale={I18n.locale}
                      userReport={skillGapData}
                      skipLogic={false}
                      allowEdit={false}
                      allowApprove={false}
                    />
                  </Flex>
                </>
              )}
            </>
          )}
      </Content>
      <Flex justify="center" className="mt-5 mb-5">
        <ButtonWithArrow
          label={I18n.t('idp.initial_steps.add_skills_step')}
          size="small"
          type="primary"
          onClick={() => next()}
        />
      </Flex>
    </>
  )
}
