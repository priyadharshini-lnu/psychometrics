import { FC, useState, useEffect } from 'react'
import {
  Modal, Typography, Button, Flex,
} from '@thetalententerprise/glint'
import previewImage from '~/assets/assessor-new-experience.gif'
import { CheckOutlined, ArrowRightOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import { useResources } from '~/hooks/useResources'
import { UserPreference } from '~/components/AdminShell/core'
import { currentUserFromInitialState, findPreference } from '~/components/AdminShell/currentUserDetails'
import { WORKSPACE_CATEGORY, NEW_EXPERIENCE_CONFIG_KEY, NOTICE_CONFIG_KEY } from './consts'
import styles from './NewExperienceNotice.less'


const { I18n } = window

const isNoticeNeeded = (): boolean => {
  const preferences = currentUserFromInitialState()?.preferences ?? []
  const noticeSeen = findPreference(preferences, WORKSPACE_CATEGORY, NOTICE_CONFIG_KEY)?.seen === true
  const newExperienceEnabled = findPreference(
    preferences, WORKSPACE_CATEGORY, NEW_EXPERIENCE_CONFIG_KEY,
  )?.enabled === true
  return !noticeSeen && !newExperienceEnabled
}

const bullets = [
  {
    key: 'candidate',
    strong: I18n.t('admin.new_experience_bullet_candidate_strong'),
    rest: I18n.t('admin.new_experience_bullet_candidate_rest'),
  },
  {
    key: 'brief',
    strong: I18n.t('admin.new_experience_bullet_brief_strong'),
    rest: I18n.t('admin.new_experience_bullet_brief_rest'),
  },
  {
    key: 'moderation',
    strong: I18n.t('admin.new_experience_bullet_moderation_strong'),
    rest: I18n.t('admin.new_experience_bullet_moderation_rest'),
  },
]

export const NewExperienceNotice: FC = () => {
  const [visible, setVisible] = useState(isNoticeNeeded)
  const { createResource } = useResources<UserPreference>('user_preferences')

  const tryNewExperience = () => {
    Promise.all([
      createResource({ category: WORKSPACE_CATEGORY, config_key: NOTICE_CONFIG_KEY, payload: { seen: true } }),
      createResource({
        category: WORKSPACE_CATEGORY,
        config_key: NEW_EXPERIENCE_CONFIG_KEY,
        payload: { enabled: true },
      }),
    ]).finally(() => {
      window.location.href = '/assessors'
    })
  }

  const dismiss = () => {
    createResource({
      category: WORKSPACE_CATEGORY,
      config_key: NOTICE_CONFIG_KEY,
      payload: { seen: true },
    }).catch(() => {})
    setVisible(false)
  }

  const WORDS = [
    I18n.t('admin.new_experience_word_candidate'),
    I18n.t('admin.new_experience_word_evaluate'),
    I18n.t('admin.new_experience_word_moderate'),
    I18n.t('admin.new_experience_word_assessment_centre'),
  ]

  const [activeWordIndex, setActiveWordIndex] = useState(0)
  const [animKey, setAnimKey] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveWordIndex(prev => (prev + 1) % WORDS.length)
      setAnimKey(prev => prev + 1)
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  return (
    <Modal
      centered
      open={visible}
      footer={null}
      closable={false}
      width={1200}
      className={styles.modal}
    >
      <Flex>
        <Flex vertical align="center" className={`${styles.leftPanel} p-6`}>
          <img
            src={previewImage}
            alt={I18n.t('admin.new_experience_preview_alt')}
            className={styles.previewImage}
            width={600}
            height={600}
          />
          <Typography.Text
            className={`p-4 ${styles.wordCycle}`}
            style={{ alignSelf: 'flex-start' }}
            strong
            key={animKey}
          >
            {WORDS[activeWordIndex]}
          </Typography.Text>
        </Flex>

        <Flex vertical gap={16} className={`${styles.rightPanel} p-12`}>
          <div className={`${styles.badge} mb-4`}>
            <span className={styles.badgeDot} />
            <Typography.Text
              strong
              style={{ fontSize: 'var(--ant-font-size-sm)' }}
              className="transform-uppercase"
            >
              {I18n.t('admin.new_experience_badge')}
            </Typography.Text>
          </div>

          <Typography.Title level={2}>
            {I18n.t('admin.new_experience_headline')}
          </Typography.Title>

          <Typography.Paragraph>
            {I18n.t('admin.new_experience_sub_copy')}
          </Typography.Paragraph>

          <Flex vertical gap={12}>
            {bullets.map(b => (
              <Flex key={b.key} align="flex-start" gap={10}>
                <CheckOutlined className={styles.checkIcon} />
                <Typography.Text>
                  <Typography.Text strong>{b.strong}</Typography.Text>
                  {' '}
                  {b.rest}
                </Typography.Text>
              </Flex>
            ))}
          </Flex>

          <Flex gap={12} align="center">
            <Button size="large" onClick={dismiss}>
              {I18n.t('admin.new_experience_notice_maybe_later')}
            </Button>
            <Button
              type="primary"
              size="large"
              icon={<ArrowRightOutlined />}
              iconPlacement="end"
              onClick={tryNewExperience}
            >
              {I18n.t('admin.assessor_try_new_experience')}
            </Button>
          </Flex>
          <Typography.Paragraph className="mt-6" strong>
            {I18n.t('admin.new_experience_footer_note')}
          </Typography.Paragraph>
        </Flex>
      </Flex>
    </Modal>
  )
}
