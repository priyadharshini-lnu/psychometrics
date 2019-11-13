import _ from 'lodash'
import React, { Component } from 'react'
import { Modal } from 'react-bootstrap'
import store from 'rb/store/modals/AliasStore'
import styles from './AliasModal.scss'
import Alias from './Alias'

const {
  Header, Body, Footer, Title,
} = Modal

export class AliasModal extends Component {
  componentDidMount () {
    this.popupListener = store.addListener('change', () => this.forceUpdate())
  }

  componentWillUnmount () {
    this.popupListener.remove()
  }

  close () {
    store.close()
  }

  save () {
    store.showSavePopUp()
  }

  renderData () {
    const factors = store.structuredFactors
    if (factors.length) {
      return (
        <table className={styles.mainTable}>
          <thead>
            <tr>
              <th>Factor</th>
              <th>Factor Alias</th>
            </tr>
          </thead>
          <tbody>
            {this.renderAliases(factors)}
          </tbody>
        </table>
      )
    }
    return (
      <div>No Aliases</div>
    )
  }

  renderAliases (factors) {
    return _.map(factors, (factor, i) => (
      <Alias key={i} model={factor} />
    ))
  }

  render () {
    if (!store.opened) { return null }
    return (
      <Modal show keyboard={false} bsSize="lg" dialogClassName={styles.modal} className={styles.firstModal}>
        <Header>
          <Title>Aliases</Title>
        </Header>
        <Body>
          {this.renderData()}
        </Body>
        <Footer>
          <button className="btn btn-success" onClick={this.save}>Save</button>
          <button className="btn btn-danger" onClick={this.close}>Cancel</button>
        </Footer>
      </Modal>
    )
  }
}

export default AliasModal
