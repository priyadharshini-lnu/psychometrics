import {
  Button, Modal, Row, Tooltip, Typography,
} from 'antd'
import { CopyOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import { ReactCodemirror } from '~/glint/components/ReactCodemirror'

import styles from './JSONViewCopy.less'

const { I18n } = window

interface Props {
  show: boolean
  json: unknown
  title: string
  onCopy: () => void
  onClose: () => void
}

const JSONViewCopy = ({
  show,
  json,
  title,
  onCopy,
  onClose,
}: Props) => {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(json))
      onCopy?.()
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = JSON.stringify(json)
      textArea.style.position = 'fixed'
      textArea.style.left = '-9999px'
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      onCopy?.()
    }
  }

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
      destroyOnHidden
    >
      <div className={styles.body}>
        <ReactCodemirror
          value={JSON.stringify(json, null, 2)}
          mode="json"
          readOnly
          lineWrapping
        />
        <Tooltip title={I18n.t('common.actions.copy')}>
          <Button
            type="text"
            icon={<CopyOutlined />}
            onClick={handleCopy}
            className={styles.copy}
          />
        </Tooltip>
      </div>
    </Modal>
  )
}

export default JSONViewCopy
