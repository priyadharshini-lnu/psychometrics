import {
  Button, Typography, Tag, Divider, Modal,
  Card,
  Flex,
  Alert,
} from 'antd'
import {
  CheckOutlined,
  CopyOutlined,
  ReloadOutlined,

} from '~/glint/icons/AccessibleIconsAntDesign'
import { SafeHTML } from '~/components/SafeHTML'
import { AssistantOutput } from './types'

interface ResultProps {
  selectedText: string
  assistantOutput: AssistantOutput
  loading: boolean
  visible: boolean
  handleClose: () => void
  handleCopy: () => void
  handleReplace: () => void
  handleTryAgain: () => void
  error?: string | null
}

const { I18n } = window

const Result: React.FC<ResultProps> = ({
  selectedText,
  assistantOutput,
  loading,
  visible,
  handleClose,
  handleCopy,
  handleReplace,
  handleTryAgain,
  error,
}) => {
  const isError = !!error

  const footer = (
    <Flex justify="space-between" align="center" style={{ width: '100%' }}>
      <Button
        key="try-again"
        icon={<ReloadOutlined />}
        onClick={handleTryAgain}
      >
        {I18n.t('shared.try_again')}
      </Button>
      {!isError && (
        <Flex gap="small">
          <Button key="copy" icon={<CopyOutlined />} onClick={handleCopy}>
            {I18n.t('shared.copy')}
          </Button>
          <Button
            key="replace"
            type="primary"
            icon={<CheckOutlined />}
            onClick={handleReplace}
          >
            {I18n.t('shared.replace')}
          </Button>
        </Flex>
      )}
    </Flex>
  )

  return (
    <Modal
      title={I18n.t('admin.toolbar_ai_suggestion')}
      open={visible}
      onCancel={handleClose}
      footer={footer}
      loading={loading}
      width={900}
    >
      <Flex gap={8}>
        <Card style={{ flex: 1 }}>
          <Typography.Text strong>
            {I18n.t('admin.original_text')}
          </Typography.Text>
          <div style={{ marginTop: 8 }}>
            <SafeHTML html={selectedText} as="div" config="adminRichText" />
          </div>
        </Card>
        <Card style={{ flex: 1 }}>
          <Typography.Text strong>
            {isError ? I18n.t('admin.error') : I18n.t('admin.result')}
          </Typography.Text>

          {isError ? (
            <Typography.Paragraph style={{ marginTop: 8 }}>
              <Typography.Text type="danger">
                {error}
              </Typography.Text>
            </Typography.Paragraph>
          ) : (
            <div style={{ marginTop: 8 }}>
              <SafeHTML html={assistantOutput.result} as="div" config="adminRichText" />
            </div>
          )}
        </Card>
      </Flex>

      {!isError && assistantOutput.whatChangedAndWhy && (
        <>
          <Divider style={{ margin: '12px 0 10px' }} />
          <Card>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                marginBottom: 6,
              }}
            >
              <Typography.Text strong>
                {I18n.t('admin.toolbar_what_changed_and_why')}
              </Typography.Text>
              <Tag
                color="blue"
                style={{
                  margin: 0,
                  fontSize: 12,
                  padding: '0 6px',
                  lineHeight: '18px',
                }}
              >
                {I18n.t('admin.toolbar_ai_insight')}
              </Tag>
            </div>
            <Typography.Paragraph>
              {assistantOutput.whatChangedAndWhy}
            </Typography.Paragraph>
          </Card>
          <Alert
            type="warning"
            showIcon
            title={I18n.t('shared.ai_toolbar_disclaimer')}
            style={{ marginTop: 12 }}
          />
        </>
      )}
    </Modal>
  )
}

export default Result
