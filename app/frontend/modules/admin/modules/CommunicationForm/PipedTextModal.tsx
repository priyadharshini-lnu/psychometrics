import React, { useEffect } from 'react'
import {
  Modal, Button, List, Card,
} from 'antd'
import FIELDS from './pipetextFields'
import types from '~/components/Editor/PipedTextModal/types/'

interface Props {
  close: () => void
  editorRef: any // eslint-disable-line @typescript-eslint/no-explicit-any
  communicationKind: string
  targetField?: 'editor' | 'subject'
  onInsert?: (value: string) => void
  open: boolean
}

const { I18n } = window

export const PipedTextModal: React.FC<Props> = ({
  close,
  editorRef,
  communicationKind,
  targetField = 'editor',
  onInsert,
  open = true,
}) => {
  useEffect(() => {
    if (targetField === 'editor' && editorRef) {
      editorRef.selection.save()
    }
  }, [])

  const handleClose = () => {
    close()
    if (targetField === 'editor' && editorRef) {
      editorRef.selection.restore()
    }
  }

  const insert = (value) => {
    handleClose()
    if (onInsert) {
      onInsert(value)
    } else if (targetField === 'editor' && editorRef) {
      editorRef.html.insert(value)
    }
  }

  const applicationFields = () => FIELDS.filter(field => (targetField === 'subject'
    ? field.branch === 'Campaigns' || field.branch === 'Projects'
    : field.supportedCommunicationKind === undefined
      || field.supportedCommunicationKind.includes(communicationKind))).map(
    field => (targetField === 'subject' && field.branch === 'Campaigns'
      ? { ...field, fields: field.fields.filter(f => f.name !== 'Join Link') }
      : field),
  )

  return (
    <Modal
      width={900}
      open={open}
      title={I18n.t('administration.piped_text_modal.title')}
      onCancel={handleClose}
      footer={[
        <Button key="back" onClick={handleClose}>
          {I18n.t('common.actions.cancel')}
        </Button>,
      ]}
      zIndex={10000}
    >
      <List
        grid={{ gutter: 16, column: 2 }}
        dataSource={applicationFields()}
        renderItem={item => (
          <List.Item>
            <Card title={item.branch}>
              {item.fields.map((field) => {
                const Component = types[field.type]
                return (
                  <div key={field.name}>
                    <Component
                      insert={insert}
                      key={field.name}
                      field={field}
                    />
                    <br />
                  </div>
                )
              })}
            </Card>
          </List.Item>
        )}
      />
    </Modal>
  )
}
