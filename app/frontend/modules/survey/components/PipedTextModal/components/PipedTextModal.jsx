import { Component } from 'react'
import { Modal } from 'react-bootstrap'
import styles from './PipedTextModal.less'
import types from './types'
import FIELDS from './fields'

const {
  Header, Body, Footer, Title,
} = Modal

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
      <Modal show keyboard={false} bsSize="lg" dialogClassName={styles.modal}>
        <Header>
          <Title>Piped Text</Title>
        </Header>
        <Body>
          {FIELDS.map((branch, i) => (
            <div key={i} className="col-sm-6">
              <div className="panel">
                <div className="panel-heading">
                  <h3 className="panel-title">{branch.branch}</h3>
                </div>
                <div className="panel-body">
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
                </div>
              </div>
            </div>
          ))}
        </Body>
        <Footer>
          <button className="btn btn-danger" onClick={close}>Cancel</button>
        </Footer>
      </Modal>
    )
  }
}

export default PipedTextModal
