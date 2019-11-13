import _ from 'lodash'
import React, { Component } from 'react'
import { Modal } from 'react-bootstrap'
import store from 'rb/store/modals/ConditionTextStore'
import styles from './ConditionalTextModal.scss'
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

  getBtnLabel (type) {
    switch (type) {
      case 'Text':
        return 'Conditional Text'
      case 'Graph':
        return 'Conditional Coloring'
      case 'Shape':
        return 'Conditional Style'
      default:
    }
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
          <Title>
            Conditional
            {store.module.type}
          </Title>
        </Header>
        <Body>
          {this.renderCollections()}
        </Body>
        <Footer>
          <button className="btn btn-default" style={{ float: 'left' }} onClick={this.addCollection}>
            Add
            {this.getBtnLabel(store.module.type)}
          </button>
          <button className="btn btn-success" onClick={this.save}>Save</button>
          <button className="btn btn-danger" onClick={this.close}>Cancel</button>
        </Footer>
      </Modal>
    )
  }
}

export default ConditionalTextModal
