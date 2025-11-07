
import {
  Spin, Flex, Layout,
  Typography,
} from 'antd'
import Report from '~/modules/reports/report'
import styles from './SkillGapReport.less'

const { Content } = Layout

const { I18n } = window

export const SkillGapReportContent = ({ skillGapData, isLoading }) => (
  <Content className={styles.reportContainer} role="region" aria-label={I18n.t('idp.skill_gap_report.title')}>
    {
          isLoading ? (
            <Flex gap={4} vertical style={{ height: '80vh' }} justify="center" align="center">
              <Spin size="large" aria-label={I18n.t('idp.loader_icon')} />
              <Typography.Text style={{ color: 'var(--ant-primary-color)' }} role="status">
                {I18n.t('idp.fetching_skill_gap_report')}
              </Typography.Text>
            </Flex>
          ) : (
            <>
              {skillGapData && (
                <Flex
                  role="region"
                  aria-label={I18n.t('idp.skill_gap_report.content')}
                  justify="center"
                  className="mb-5 mt-8"
                >
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
          )
        }
  </Content>
)
