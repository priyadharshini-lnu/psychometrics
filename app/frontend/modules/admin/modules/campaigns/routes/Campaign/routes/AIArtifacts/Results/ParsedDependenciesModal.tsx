import React from 'react'
import {
  Button, Modal, message, Tooltip,
} from 'antd'
import { InfoCircleOutlined } from '~/glint/icons/AccessibleIconsAntDesign'

const { I18n } = window

interface ParsedDependenciesModalProps {
  show: boolean
  content: string | null
  onClose: () => void
}

const ParsedDependenciesModal: React.FC<ParsedDependenciesModalProps> = ({
  show,
  content,
  onClose,
}) => (
  <Modal
    title={(
      <span>
        {I18n.t('admin.parsed_dependencies_title')}
        {' '}
        <Tooltip title={I18n.t('admin.parsed_dependencies_help')}>
          <span><InfoCircleOutlined style={{ color: '#1890ff' }} /></span>
        </Tooltip>
      </span>
      )}
    open={show}
    onCancel={onClose}
    footer={[
      <Button
        onClick={() => {
          if (!content) {
            return
          }
          navigator.clipboard.writeText(content)
          message.info(I18n.t('user_assessment.drawer.copied', {
            name: I18n.t('admin.parsed_dependencies_title'),
          }))
        }}
      >
        {I18n.t('shared.copy')}
      </Button>,
      <Button onClick={onClose}>
        {I18n.t('shared.close')}
      </Button>,
    ]}
    width={800}
  >
    <pre style={{
      whiteSpace: 'pre-wrap',
      backgroundColor: '#f5f5f5',
      padding: '15px',
      borderRadius: '4px',
      maxHeight: '400px',
      minHeight: '200px',
      overflowY: 'auto',
      fontSize: '12px',
      fontFamily: 'monospace',
    }}
    >
      {content || I18n.t('shared.no_data_found')}
    </pre>
  </Modal>
)

export default ParsedDependenciesModal
