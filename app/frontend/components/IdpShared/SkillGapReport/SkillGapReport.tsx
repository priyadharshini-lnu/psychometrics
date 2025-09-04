import {
  useContext,
} from 'react'
import {
  Typography,
  Row, Col, Spin, Flex, Layout, Space,
} from 'antd'
import {
  ButtonWithArrow, MediaQueryContext, BackButton,
} from '~/glint'
import Report from '~/modules/reports/report'
import { DownloadButton } from '../DownloadButton'
import { Separator } from '../Separator'

const { Content } = Layout

const { I18n } = window

export const SkillGapReport = ({
  next, skillGapData, reportUrl, isLoading, styles, prev,
}) => {
  const { isMobile } = useContext(MediaQueryContext)

  const extraContent = (isLoading ? <></>
    : (
      reportUrl && (
        <DownloadButton
          disabled={skillGapData?.status !== 'prepared'}
          href={reportUrl}
          style={{ height: '2rem' }}
        >
          {I18n.t('idp.skill_gap_report.download')}
        </DownloadButton>
      )
    )
  )

  return (
    <>
      <Flex vertical={isMobile} className="mt-4 mb-4" flex={1} justify="space-between">
        <Space>
          <BackButton
            onPrev={prev}
          />
          <Typography.Title
            className="mb-0 mt-0"
            level={3}
          >
            {I18n.t('idp.initial_steps.skill_gap_report')}
          </Typography.Title>
        </Space>
        <Flex justify="center" align="center">
          {extraContent}
          <ButtonWithArrow
            label="Add Skills"
            size="small"
            type="primary"
            onClick={() => next()}
          />
        </Flex>
      </Flex>
      <Separator
        className="mb-4 mt-0"
      />
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
                <Flex justify="center" className="mb-5 mt-8">
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
              )}
            </>
          )}
      </Content>
    </>
  )
}
