import React, { Component } from 'react'
import { Modal } from 'react-bootstrap'
import store from 'rb/store/modals/PipedTextModal'
import AppStore from 'rb/store/AppStore'
import styles from './PipedTextModal.scss'
import types from './types'
import FIELDS from './fields'

const { Header } = Modal
const { Body } = Modal
const { Footer } = Modal
const { Title } = Modal

export class PipedTextModal extends Component {
  componentDidMount () {
    this.popupListener = store.addListener('change', () => this.forceUpdate())
  }

  componentWillUnmount () {
    this.popupListener.remove()
  }

  onChange = (text) => {
    store.text = text
  }

  close () {
    store.close()
  }

  render () {
    if (!store.opened) { return null }
    const datasheetFields = AppStore.report.dataSheetColumns
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
                        insert={value => store.insert(value)}
                        key={field.name}
                        field={field}
                        context={{ datasheetFields }}
                      />
                    )
                  })}
                </div>
              </div>
            </div>
          ))}
        </Body>
        <Footer>
          <button className="btn btn-danger" onClick={this.close}>Cancel</button>
        </Footer>
      </Modal>
    )
  }
}

export default PipedTextModal
