import React, { useEffect } from 'react'
import {
  Modal, Button, List, Card,
} from 'antd'
import FIELDS from './fields'
import types from './types'

export default function PipedTextModal ({
  closeModal, datasheetFields, data: { editorRef, type },
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

  const getFields = () => FIELDS.filter(field => field.supportedTypes.includes(type))

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
