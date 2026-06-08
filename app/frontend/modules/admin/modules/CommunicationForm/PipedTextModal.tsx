import React, { useEffect, useRef } from 'react'
import {
  Modal, Button, List, Card,
} from 'antd'
import FIELDS from './pipetextFields'
import types from '~/components/Editor/PipedTextModal/types/'
import styles from './PipedTextModal.less'

interface Props {
  close: () => void
  editorRef: any // eslint-disable-line @typescript-eslint/no-explicit-any
  communicationKind: string
  targetField?: 'editor' | 'subject'
  onInsert?: (value: string) => void
  open: boolean
}

const { I18n } = window

let scrollInfo: { element: Element | null; scrollTop: number } = { element: null, scrollTop: 0 }

export const PipedTextModal: React.FC<Props> = ({
  close,
  editorRef,
  communicationKind,
  targetField = 'editor',
  onInsert,
  open = true,
}) => {
  const modalContainerRef = useRef(null)

  useEffect(() => {
    if (targetField === 'editor' && editorRef) {
      editorRef.selection.save()
    }

    if (open) {
      if (scrollInfo.element === null) {
        const modalElement = document.querySelector('#modal-container .modal')

        if (modalElement && modalElement.scrollTop > 0) {
          scrollInfo = { element: modalElement, scrollTop: modalElement.scrollTop }
        }
        // Reset to top
        if (modalElement) {
          modalElement.scrollTop = 0
        }
      }
    }
  }, [open])


  const handleClose = () => {
    // Restore scroll position
    if (scrollInfo.element && scrollInfo.scrollTop > 0) {
      scrollInfo.element.scrollTop = scrollInfo.scrollTop
    }
    scrollInfo = { element: null, scrollTop: 0 }

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
    <>
      <div ref={modalContainerRef} />
      <Modal
        width={900}
        open={open}
        title={I18n.t('admin.piped_text_modal_title')}
        onCancel={handleClose}
        footer={[
          <Button key="back" onClick={handleClose}>
            {I18n.t('shared.cancel')}
          </Button>,
        ]}
        zIndex={10000}
        wrapClassName={styles.modalWrap}
        getContainer={() => modalContainerRef.current || document.body}
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
    </>
  )
}
