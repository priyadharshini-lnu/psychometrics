import {
  Button, Flex, Typography, Popconfirm,
  Avatar,
} from 'antd'
import { Bubble } from '@ant-design/x'
import {
  MessageOutlined, FileOutlined, RightOutlined, UploadOutlined, CheckCircleOutlined,
} from '@ant-design/icons'
import { BotIcon } from './BotIcon'
import styles from './styles.less'

const { I18n } = window

export const RetakeSteps = ({ onAction, aiAssistedIdpHasDocumentAnalysis }) => (
  <Bubble
    placement="start"
    variant="outlined"
    shape="round"
    styles={{ body: { width: '90%' } }}
    avatar={<Avatar icon={<BotIcon />} />}
    content={(
      <Flex vertical align="center" justify="center" className={styles.retakeSteps} gap={24}>
        <Flex vertical align="center" style={{ width: '100%' }}>
          <Typography.Title level={3}>{I18n.t('idp.ai.retake_steps.chat_title')}</Typography.Title>
          <Typography.Text type="secondary">
            {aiAssistedIdpHasDocumentAnalysis
              ? I18n.t('idp.ai.retake_steps.chat_hint') : I18n.t('enduser.ai_idp_retake_step_chat_hint_no_document')}
          </Typography.Text>
        </Flex>
        <Flex justify={aiAssistedIdpHasDocumentAnalysis ? 'space-between' : 'space-around'} style={{ width: '100%' }}>
          <Flex vertical align="center" gap={12}>
            <div className={styles.iconContainer} style={{ background: '#a1d7d4' }}>
              <MessageOutlined className={styles.icon} />
            </div>
            <Typography.Text strong>{I18n.t('idp.ai.retake_steps.start_chat')}</Typography.Text>
            <Popconfirm
              overlayStyle={{ zIndex: 9999 }}
              title={I18n.t('idp.ai.reset_confirmation')}
              onConfirm={() => onAction('retakeChat')}
              okText={I18n.t('common.actions.yes')}
              cancelText={I18n.t('common.actions.no')}
            >
              <Button type="primary" size="small">
                {I18n.t('idp.ai.retake_steps.start_chat_again')}
                <RightOutlined />
              </Button>
            </Popconfirm>

          </Flex>
          {aiAssistedIdpHasDocumentAnalysis && (
            <Flex vertical align="center" gap={12}>
              <div className={styles.iconContainer} style={{ background: '#75c895' }}>
                <FileOutlined className={styles.icon} />
              </div>
              <Typography.Text strong>{I18n.t('idp.ai.retake_steps.upload_document')}</Typography.Text>
              <Button type="primary" size="small" icon={<UploadOutlined />} onClick={() => onAction('retakeDocument')}>
                {I18n.t('idp.ai.retake_steps.upload_file')}
              </Button>
            </Flex>
          )}
          <Flex vertical align="center" gap={12}>
            <div className={styles.iconContainer} style={{ background: '#75c895' }}>
              <CheckCircleOutlined className={styles.icon} />
            </div>
            <Typography.Text strong>
              {I18n.t('enduser.idp_retake_steps_continue_with_this_information')}
            </Typography.Text>
            <Button type="primary" size="small" icon={<CheckCircleOutlined />} onClick={() => onAction('complete')}>
              {I18n.t('shared.continue')}
            </Button>
          </Flex>
          {/* <Flex vertical align="center" gap={12}>
            <div className={styles.iconContainer} style={{ background: '#eaca81' }}>
              <AudioOutlined className={styles.icon} />
            </div>
            <Typography.Text strong>Interview</Typography.Text>
            <Button type="primary" size="small" onClick={() => onAction('retakeInterview')}>
              Start Interview Again
              <RightOutlined />
            </Button>
          </Flex> */}
        </Flex>
      </Flex>
    )}
  />
)
