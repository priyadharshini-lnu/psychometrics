import { useRef } from 'react'
import {
  Button, Modal, Row, Tooltip, Typography,
} from 'antd'
import { type Editor } from 'codemirror'
import { UnControlled as CodeMirror } from 'react-codemirror2'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import { CopyOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import 'codemirror/lib/codemirror.css'
import 'codemirror/mode/javascript/javascript'

import styles from './JSONViewCopy.less'

const { I18n } = window

interface Props {
  show: boolean
  json: unknown
  title: string
  onCopy: () => void
  onClose: () => void
  cmOptions?: unknown
}

const JSONViewCopy = ({
  show,
  json,
  title,
  onCopy,
  onClose,
  cmOptions = {
    mode: {
      name: 'javascript',
      json: true,
    },
    readOnly: true,
    lineWrapping: true,
  },
}: Props) => {
  const editorRef = useRef(null)

  return (
    <Modal
      title={(
        <Row align="middle">
          <Typography.Title level={5} className="mb-0 mt-0">{title}</Typography.Title>
        </Row>
      )}
      open={show}
      onCancel={() => onClose?.()}
      footer={null}
      afterOpenChange={(open) => {
        if (open && editorRef.current) {
          (editorRef.current as Editor)?.refresh()
        }
      }}
      destroyOnClose
    >
      <div className={styles.body}>
        <CodeMirror
          value={JSON.stringify(json, null, 2)}
          options={cmOptions}
          editorDidMount={(editor) => {
            editorRef.current = editor
          }}
        />
        <CopyToClipboard
          text={JSON.stringify(json)}
          onCopy={() => onCopy?.()}
          className={styles.copy}
        >
          <Tooltip title={I18n.t('common.actions.copy')}>
            <Button type="text" icon={<CopyOutlined />} />
          </Tooltip>
        </CopyToClipboard>
      </div>
    </Modal>
  )
}

export default JSONViewCopy
