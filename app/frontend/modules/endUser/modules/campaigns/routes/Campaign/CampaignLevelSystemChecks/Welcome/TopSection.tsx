import {
  useContext,
} from 'react'
import { useSelector } from 'react-redux'
import {
  Typography, Row, Col, Skeleton,
} from 'antd'
import { RootState } from '~/modules/endUser/core/rootReducers'
import { MediaQueryContext } from '~/glint'
import {
  ClockCircleOutlined, DesktopOutlined,
  WifiOutlined, VideoCameraOutlined, AudioOutlined,
} from '~/glint/icons/AccessibleIconsAntDesign'
import { secondsToDuration } from '~/utils/time'
import styles from './styles.less'
import { CHECK_TYPE } from '../common'

const { I18n } = window

export const TopSection = () => {
  const campaignDetailsForSystemCheck = useSelector(
    (state: RootState) => state.campaigns.systemCheck.currentCampaignForSystemCheck,
  )

  const { requiredSystemChecks = [] } = campaignDetailsForSystemCheck || {}

  const { isTablet, isDesktop } = useContext(MediaQueryContext)


  return (
    <Row gutter={[32, 16]} style={{ marginInline: '-8px' }}>
      <Col span={isTablet || isDesktop ? 24 : 12}>
        <Row
          className={styles['top-border-colored-card']}
          gutter={[16, 16]}
        >
          <Col span={24}>
            <Row align="middle" gutter={[8, 8]}>
              <Col>
                <ClockCircleOutlined style={{ fontSize: '2rem', color: 'var(--ant-primary-color)' }} />
              </Col>
              <Col>
                <Typography.Text style={{ fontWeight: '700' }}>
                  {I18n.t('enduser.time_commitment')}
                </Typography.Text>
              </Col>
            </Row>
          </Col>

          <Col span={24}>
            <Row justify="space-between" align="middle" gutter={[8, 8]}>
              <Col>
                <Typography.Text>{I18n.t('enduser.system_check')}</Typography.Text>
              </Col>
              <Col>
                <Typography.Text style={{ fontWeight: '700' }}>
                  {I18n.t('enduser.less_than_five_minutes')}
                </Typography.Text>
              </Col>
            </Row>
          </Col>

          <Col span={24}>
            <Row justify="space-between" align="middle" gutter={[8, 8]}>
              <Col>
                <Typography.Text>{I18n.t('enduser.task_duration')}</Typography.Text>
              </Col>
              <Col>
                {campaignDetailsForSystemCheck ? (
                  <Typography.Text style={{ fontWeight: '700' }}>
                    {
                                campaignDetailsForSystemCheck?.campaignTime ? (
                                  <>
                                    {secondsToDuration(campaignDetailsForSystemCheck?.campaignTime * 60)}
                                  </>
                                ) : I18n.t('enduser.untimed')}
                  </Typography.Text>
                ) : (<Skeleton.Input style={{ width: 20 }} active />)}

              </Col>
            </Row>
          </Col>

          <Col span={24} style={{ height: '100%' }}>
            <Typography.Text>
              {I18n.t('enduser.plan_text')}
            </Typography.Text>
          </Col>
        </Row>
      </Col>

      <Col span={isTablet || isDesktop ? 24 : 12}>
        <Row
          className={styles['top-border-colored-card']}
          gutter={[16, 16]}
        >
          <Col span={24}>
            <Row align="middle" gutter={[8, 8]}>
              <Col>
                <DesktopOutlined style={{ fontSize: '2rem', color: 'var(--ant-primary-color)' }} />
              </Col>
              <Col>
                <Typography.Text style={{ fontWeight: '700' }}>
                  {I18n.t('enduser.system_checks')}
                </Typography.Text>
              </Col>
            </Row>
          </Col>

          <Col span={24}>
            <Row justify="space-between" gutter={[16, 16]}>
              <Col>
                <Row align="middle" gutter={[8, 8]}>
                  <Col>
                    <DesktopOutlined style={{ fontSize: '1rem' }} />
                  </Col>
                  <Col>
                    <Typography.Text>{I18n.t('enduser.browser_and_device')}</Typography.Text>
                  </Col>
                </Row>
              </Col>

              <Col>
                {requiredSystemChecks?.includes(CHECK_TYPE.network) ? (
                  <Row align="middle" gutter={[8, 8]}>
                    <Col>
                      <WifiOutlined style={{ fontSize: '1rem' }} />
                    </Col>
                    <Col>
                      <Typography.Text>{I18n.t('enduser.internet_speed')}</Typography.Text>
                    </Col>
                  </Row>
                ) : (
                  <Row align="middle" gutter={[8, 8]}>
                    <Col style={{ height: '1.5rem' }} />
                    <Col />
                  </Row>
                )}
              </Col>
            </Row>
          </Col>

          <Col span={24}>
            <Row justify="space-between" gutter={[16, 16]}>
              <Col>
                {requiredSystemChecks?.includes(CHECK_TYPE.video)
                || requiredSystemChecks?.includes(CHECK_TYPE.audio) ? (
                  <Row align="middle" gutter={[8, 8]}>
                    <Col>
                      {requiredSystemChecks?.includes(CHECK_TYPE.video)
                      && <VideoCameraOutlined style={{ fontSize: '1rem' }} />}

                      {requiredSystemChecks?.includes(CHECK_TYPE.audio)
                       && <AudioOutlined style={{ fontSize: '1rem' }} />}
                    </Col>
                    <Col>
                      {requiredSystemChecks?.includes(CHECK_TYPE.video)
                      && <Typography.Text>{I18n.t('enduser.video_and_audio')}</Typography.Text>}

                      {requiredSystemChecks?.includes(CHECK_TYPE.audio)
                       && <Typography.Text>{I18n.t('enduser.audio')}</Typography.Text>}
                    </Col>
                  </Row>
                  ) : (
                    <Row align="middle" gutter={[8, 8]}>
                      <Col style={{ height: '1.5rem' }} />
                      <Col />
                    </Row>
                  )}
              </Col>
            </Row>
          </Col>

          <Col span={24} style={{ height: '100%' }}>
            <Typography.Text>
              {I18n.t('enduser.all_checks_must_pass')}
            </Typography.Text>
          </Col>
        </Row>
      </Col>
    </Row>
  )
}
