import { ChangeEvent, FC } from 'react'
import {
  Row, Col, Input, Typography, Tooltip,
} from 'antd'
import ReactMarkdown from 'react-markdown'
import { InfoCircleOutlined } from '~/glint/icons/AccessibleIconsAntDesign'

import styles from './styles.less'

const { I18n } = window

interface Props {
  value?: string
  onChange?: (event: ChangeEvent<HTMLTextAreaElement>) => void
}

export const MarkdownEditor: FC<Props> = ({ value, onChange }) => (
  <>
    <Row className={styles.headerRow}>
      <Col span="12" className={styles.headerRowCol}>
        <Row justify="space-between" align="middle">
          <Typography.Text>
            {I18n.t(
              'admin.sheets_drawers_add_edit_markdown_title',
            )}
          </Typography.Text>
          <Tooltip title="Markdown help">
            <span><InfoCircleOutlined /></span>
          </Tooltip>
        </Row>
      </Col>
      <Col span="12" className={styles.headerRowCol}>
        <Typography.Text>
          {I18n.t(
            'admin.sheets_drawers_add_edit_markdown_preview',
          )}
        </Typography.Text>
      </Col>
    </Row>
    <Row align="stretch" justify="center" className={styles.container}>
      <Col span="12" className={styles.editor}>
        <Input.TextArea value={value} onChange={onChange} />
      </Col>
      <Col span="12" className={styles.viewer}>
        <ReactMarkdown>{`${value}`}</ReactMarkdown>
      </Col>
    </Row>
  </>
)
