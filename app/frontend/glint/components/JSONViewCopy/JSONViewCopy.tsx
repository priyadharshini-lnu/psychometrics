import {
  Button, Modal, Row, Tooltip, Typography,
} from 'antd'
import { CopyToClipboard } from 'react-copy-to-clipboard'
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
}: Props) => (
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

export default JSONViewCopy
