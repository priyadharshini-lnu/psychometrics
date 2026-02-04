import { Component } from 'react'
import {
  Modal, Button, Card, Row, Col,
} from 'antd'
import types from './types'
import FIELDS from './fields'

const { I18n } = window

export class PipedTextModal extends Component {
  insert = (value) => {
    const { editorRef, close } = this.props
    close()
    editorRef.selection.restore()
    editorRef.html.insert(value)
    editorRef.events.trigger('change')
  }

  render () {
    const { dataSheetColumns, close, questions } = this.props
    return (
      <Modal
        open
        width="80vw"
        title={I18n.t('admin.piped_text')}
        onCancel={close}
        footer={[
          <Button key="cancel" danger onClick={close}>{I18n.t('shared.cancel')}</Button>,
        ]}
      >
        <Row gutter={16}>
          {FIELDS.map((branch, i) => (
            <Col key={i} span={12}>
              <Card title={branch.branch} size="small" style={{ marginBottom: 16 }}>
                {branch.fields.map((field) => {
                  const Component = types[field.type]
                  return (
                    <Component
                      insert={value => this.insert(value)}
                      key={field.name}
                      field={field}
                      context={{ datasheetFields: dataSheetColumns || [], questions }}
                    />
                  )
                })}
              </Card>
            </Col>
          ))}
        </Row>
      </Modal>
    )
  }
}

export default PipedTextModal
