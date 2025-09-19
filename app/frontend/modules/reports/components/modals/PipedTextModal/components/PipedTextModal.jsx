import { Component } from 'react'
import { Modal } from 'react-bootstrap'
import AppStore from '~/modules/reports/store/AppStore'
import styles from './PipedTextModal.less'
import types from './types'
import FIELDS from './fields'

const { Header } = Modal
const { Body } = Modal
const { Footer } = Modal
const { Title } = Modal

export class PipedTextModal extends Component {
  state = {}

  insert = (value) => {
    const { editorRef, close } = this.props
    editorRef.selection.restore()
    editorRef.html.insert(value)
    close()
  }

  handleSelect = (value) => {
    if (value) {
      this.setState(prevState => ({ ...prevState, ...value }))
    }
  }

  render () {
    const { close } = this.props
    const datasheetFields = AppStore.report.dataSheetColumns
    const { flatFactors: factors } = AppStore

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
                    let autoCompleteProps = {}
                    if (field.type === 'autocomplete') {
                      autoCompleteProps = {
                        preventInsert: field.preventInsert,
                        onSelect: value => this.handleSelect(value, field.name),
                      }
                    }
                    return (
                      <Component
                        insert={this.insert}
                        key={field.name}
                        field={field}
                        context={{ datasheetFields, factors, ...this.state }}
                        {...autoCompleteProps}
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
