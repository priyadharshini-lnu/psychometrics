import _ from 'lodash'
import React, { Component } from 'react'
import { Modal } from 'react-bootstrap'
import store from 'rb/store/modals/CPIFactorConditionStore'
import styles from './CPIFactorConditionModal.scss'
import ConditionCollection from './ConditionCollection'

const {
  Header, Body, Footer, Title,
} = Modal

export class ConditionalTextModal extends Component {
  componentDidMount () {
    this.popupListener = store.addListener('change', () => this.forceUpdate())
  }

  componentWillUnmount () {
    this.popupListener.remove()
  }

  close () {
    store.close()
  }

  addCollection () {
    store.addCollection()
  }

  save () {
    store.save()
  }

  renderCollections () {
    if (store.module.textConditions.length) {
      return _.map(store.module.textConditions, (collection, i) => (
        <ConditionCollection key={i} model={collection} />
      ))
    }
    return (
      <div>No conditions</div>
    )
  }

  render () {
    if (!store.opened) { return null }
    return (
      <Modal show keyboard={false} bsSize="lg" dialogClassName={styles.modal}>
        <Header>
          <Title>Factor Conditions</Title>
        </Header>
        <Body>
          {this.renderCollections()}
        </Body>
        <Footer>
          <button
            className="btn btn-default"
            style={{ float: 'left' }}
            onClick={this.addCollection}
          >
            Add Conditional Subfactor
          </button>
          <button className="btn btn-success" onClick={this.save}>Save</button>
          <button className="btn btn-danger" onClick={this.close}>Cancel</button>
        </Footer>
      </Modal>
    )
  }
}

export default ConditionalTextModal
