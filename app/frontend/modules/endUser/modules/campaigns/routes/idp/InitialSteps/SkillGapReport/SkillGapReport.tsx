import {
  FC, useState, useEffect,
} from 'react'
import { PageHeader } from '@ant-design/pro-layout'
import {
  Row, Col, Layout, Button, Spin, Typography, Flex,
} from 'antd'
import { connect, ConnectedProps } from 'react-redux'
import { ButtonWithArrow } from '~/glint'
import { DownloadOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import styles from './styles.less'
import { RootState } from '~/modules/endUser/core/rootReducers'
import { fetchSkillGaps, FetchSkillGapsResponse } from '~/modules/endUser/modules/campaigns/core/idp/idpForm'
import Report from '~/modules/reports/report'
import rstore from '~/modules/reports/store'
import { setReportLoading } from '~/modules/reports/core/builder/actions'

const connector = connect(
  (state: RootState) => ({
    currentUser: state.currentUser,
  }),
  {
    fetchSkillGaps,
  },
)

type PropsFromRedux = ConnectedProps<typeof connector>
type SkillGapReportProps = {
  next: () => void
} & PropsFromRedux

const { Content } = Layout

const { I18n } = window

const SkillGapReportComponent: FC<SkillGapReportProps> = ({ next, currentUser, fetchSkillGaps }) => {
  const [skillGapData, setSkillGapData] = useState<FetchSkillGapsResponse | null>(null)
  const [isLoading, setLoading] = useState(true)

  useEffect(() => {
    fetchSkillGaps(currentUser.id, { lang: I18n.locale }).then((data) => {
      setSkillGapData(data.response)
    }).finally(() => {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth',
      })
      setLoading(false)
    })

    return () => {
      rstore.dispatch(setReportLoading(false))
    }
  }, [])

  const extraContent = (isLoading ? <></>
    : (
      skillGapData?.report_url && (
        <Flex className="mt-2">
          <Button
            key="download"
            icon={<DownloadOutlined />}
            disabled={skillGapData?.status !== 'prepared'}
            href={skillGapData?.report_url}
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
                  <Flex justify="center" className="mt-5 mb-5">
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

export const SkillGapReport = connector(SkillGapReportComponent)
