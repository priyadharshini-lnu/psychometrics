import React, { useEffect } from 'react'
import {
  Modal, Button, List, Card,
} from 'antd'
import { CONSOLIDATED_EMAIL_NAMES } from 'constants/emailTemplate'
import FIELDS from './fields'
import types from './types'

export default function PipedTextModal ({
  closeModal, datasheetFields, data: { editorRef, type, details },
}) {
  useEffect(() => editorRef.selection.save(), [])

  const close = () => {
    closeModal('PipedTextModal')
    editorRef.selection.restore()
  }

  const insert = (value) => {
    close()
    editorRef.html.insert(value)
  }

  const getFields = () => FIELDS.filter((field) => {
    const fieldIsSupported = field.supportedTypes.includes(type)
    if (!CONSOLIDATED_EMAIL_NAMES.includes(type) || !fieldIsSupported) { return fieldIsSupported }

    return details.consolidation ? !field.hideOnconsolidation : !field.hideOnUnconsolidation
  })

  return (
    <Modal
      width={700}
      title="Add Piped Text"
      visible
      onCancel={close}
      footer={[
        <Button key="back" onClick={close}>
          Cancel
        </Button>,
      ]}
    >
      <List
        grid={{ gutter: 16, column: 2 }}
        dataSource={getFields()}
        renderItem={item => (
          <List.Item>
            <Card title={item.branch}>
              {item.fields.map((field) => {
                const Component = types[field.type]
                return <Component insert={insert} key={field.name} field={field} context={{ datasheetFields }} />
              })}
            </Card>
          </List.Item>
        )}
      />
    </Modal>
  )
}
