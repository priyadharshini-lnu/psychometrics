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
}

const { I18n } = window

export const PipedTextModal: React.FC<Props> = ({ close, editorRef, communicationKind }) => {
  useEffect(() => editorRef.selection.save(), [])

  const handleClose = () => {
    close()
    editorRef.selection.restore()
  }

  const insert = (value) => {
    handleClose()
    editorRef.html.insert(value)
  }

  const applicationFields = () => FIELDS.filter(
    field => (
      field.supportedCommunicationKind === undefined || field.supportedCommunicationKind.includes(communicationKind)
    ),
  )

  return (
    <Modal
      width={700}
      open
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
                  <Component
                    insert={insert}
                    key={field.name}
                    field={field}
                  />
                )
              })}
            </Card>
          </List.Item>
        )}
      />
    </Modal>
  )
}
