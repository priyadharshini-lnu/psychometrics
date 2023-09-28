import { ChangeEvent, FC } from 'react'
import {
  Row, Col, Input, Typography, Tooltip,
} from 'antd'
import { InfoCircleOutlined } from '@ant-design/icons'
import ReactMarkdown from 'react-markdown'

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
              'administration.sheets.drawers.add_edit.markdown.title',
            )}
          </Typography.Text>
          <Tooltip title="Markdown help">
            <InfoCircleOutlined />
          </Tooltip>
        </Row>
      </Col>
      <Col span="12" className={styles.headerRowCol}>
        <Typography.Text>
          {I18n.t(
            'administration.sheets.drawers.add_edit.markdown.preview',
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
