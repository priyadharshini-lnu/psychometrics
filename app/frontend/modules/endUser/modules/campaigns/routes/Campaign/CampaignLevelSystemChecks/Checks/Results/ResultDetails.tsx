
import {
  useMemo,
} from 'react'
import {
  Typography, Flex, Card,
} from 'antd'
import { CHECKS } from './common'
import {
  QuestionCircleOutlined, GlobalOutlined, WifiOutlined, VideoCameraOutlined,
} from '~/glint/icons/AccessibleIconsAntDesign'
import commonStyles from '../../common-styles.less'

const { I18n } = window

const troubleShootingGuide = {
  [CHECKS.browser]: {
    heading: I18n.t('enduser.browser_compatibility'),
    Icon: GlobalOutlined,
    steps: [
      I18n.t('enduser.troubleshooting_guide_browser_first'),
      I18n.t('enduser.troubleshooting_guide_browser_second'),
      I18n.t('enduser.troubleshooting_guide_browser_third'),
      I18n.t('enduser.troubleshooting_guide_browser_fourth'),
      I18n.t('enduser.troubleshooting_guide_browser_fifth'),
      I18n.t('enduser.troubleshooting_guide_browser_sixth'),
    ],
  },

  [CHECKS.network]: {
    heading: I18n.t('enduser.internet_speed'),
    Icon: WifiOutlined,
    steps: [
      I18n.t('enduser.troubleshooting_guide_network_first'),
      I18n.t('enduser.troubleshooting_guide_network_second'),
      I18n.t('enduser.troubleshooting_guide_network_third'),
      I18n.t('enduser.troubleshooting_guide_network_fourth'),
      I18n.t('enduser.troubleshooting_guide_network_fifth'),
    ],
  },

  [CHECKS.video]: {
    heading: I18n.t('enduser.video_and_audio_recording'),
    Icon: VideoCameraOutlined,
    steps: [
      I18n.t('enduser.troubleshooting_guide_video_first'),
      I18n.t('enduser.troubleshooting_guide_video_second'),
      I18n.t('enduser.troubleshooting_guide_video_third'),
      I18n.t('enduser.troubleshooting_guide_video_fourth'),
      I18n.t('enduser.troubleshooting_guide_video_fifth'),
      I18n.t('enduser.troubleshooting_guide_video_sixth'),

    ],
  },
}

export const ResultDetails = ({ resultsData }) => {
  const resultDetailsData = useMemo(() => resultsData.filter(item => !item.result).map(item => (
    {
      check: item.check,
      information: troubleShootingGuide[item.check],
      Icon: troubleShootingGuide[item.check].Icon,
    }
  )), [resultsData])

  if (resultDetailsData.length === 0) {
    return null
  }

  return (
    <Card style={{ width: '100%' }} className={`${commonStyles['border-dark']}`}>
      <Flex gap={8}>
        <QuestionCircleOutlined className={`${commonStyles['primary-icon']}`} />
        <Typography.Title
          level={4}
          className="mt-0 mb-0"
        >
          {I18n.t('enduser.troubleshooting_guide')}
        </Typography.Title>
      </Flex>
      <Flex className="mb-4">
        <Typography.Text>{I18n.t('enduser.follow_these_steps')}</Typography.Text>
      </Flex>

      <Card
        styles={{
          body: {
            padding: '1rem',
            paddingBottom: '0.5rem',
          },
        }}
        className={`${commonStyles['border-dark']} ${commonStyles['bg-off-white']}`}
      >
        {resultDetailsData.map(item => (
          <Flex vertical key={item.check} gap={2} style={{ width: '100%' }}>
            <Flex gap={4}>
              <item.Icon style={{ fontSize: '1rem', color: 'var(--ant-primary-color)' }} />
              <Typography.Title className="mt-0 mb-0" level={5}>{item.information.heading}</Typography.Title>
            </Flex>
            <ul style={{ paddingInlineStart: '1rem' }}>
              {item.information.steps.map(step => (
                <li key={step}>
                  <Typography.Text>{step}</Typography.Text>
                </li>
              ))}
            </ul>
          </Flex>
        ))}
      </Card>
    </Card>
  )
}
