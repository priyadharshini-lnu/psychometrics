import {
  Button, Typography, Tag, Divider,
} from 'antd'
import {
  CheckOutlined,
  CopyOutlined,
  CloseOutlined,
  ReloadOutlined,

} from '@ant-design/icons'
import styles from './styles.less'
import { AssistantOutput } from './types'

interface ResultProps {
  assistantOutput: AssistantOutput
  handleClose: () => void
  handleCopy: () => void
  handleReplace: () => void
  handleTryAgain: () => void
  error?: string | null
}

const { I18n } = window

const Result: React.FC<ResultProps> = ({
  assistantOutput,
  handleClose,
  handleCopy,
  handleReplace,
  handleTryAgain,
  error,
}) => {
  const isError = !!error

  return (
    <div className={styles.resultContainer}>
      <div className={styles.resultHeader}>
        <Typography.Text strong style={{ fontSize: 14 }}>
          {I18n.t('admin.toolbar_ai_suggestion')}
        </Typography.Text>
        <Button
          type="text"
          size="small"
          icon={<CloseOutlined />}
          onClick={handleClose}
        />
      </div>
      <div className={styles.resultSection}>
        <Typography.Text strong>
          {isError ? 'Error' : 'Result'}
        </Typography.Text>

        {isError ? (
          <Typography.Paragraph style={{ marginTop: 8 }}>
            <Typography.Text type="danger">
              {error}
            </Typography.Text>
          </Typography.Paragraph>
        ) : (
          <Typography.Paragraph>
            {assistantOutput.result}
          </Typography.Paragraph>
        )}
      </div>
      {!isError && assistantOutput.whatChangedAndWhy && (
        <>
          <Divider style={{ margin: '12px 0 10px' }} />
          <div className={styles.resultSection}>
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
          </div>
        </>
      )}
      <div
        className={styles.actionFooter}
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Button
          icon={<ReloadOutlined />}
          onClick={handleTryAgain}
        >
          {I18n.t('shared.try_again')}
        </Button>
        {!isError && (
          <div style={{ display: 'flex', gap: 8 }}>
            <Button icon={<CopyOutlined />} onClick={handleCopy}>
              {I18n.t('shared.copy')}
            </Button>

            <Button
              type="primary"
              icon={<CheckOutlined />}
              onClick={handleReplace}
            >
              {I18n.t('shared.replace')}
            </Button>
          </div>
        )}
      </div>

    </div>
  )
}

export default Result
