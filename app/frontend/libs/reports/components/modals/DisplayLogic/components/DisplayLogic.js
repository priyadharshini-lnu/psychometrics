import React, { Component } from 'react'
import store from 'rb/store/modals/DisplayLogicStore'
import { Modal } from 'react-bootstrap'
import LogicElement from 'rb/components/LogicElement'
import FillingValidator from 'rb/components/LogicElement/FillingValidator'
import styles from './DisplayLogic.scss'

const {
  Header, Body, Footer, Title,
} = Modal

export default class DisplayLogic extends Component {
  componentDidMount () {
    this.storeListener = store.addListener('change', () => this.forceUpdate())
  }

  componentWillUnmount () {
    this.storeListener.remove()
  }

  close = () => {
    store.close()
    this.forceUpdate()
  }

  save = () => {
    store.save()
    this.close()
  }

  update = () => {
    this.forceUpdate()
  }

  renderConditions () {
    const { displayLogic } = store
    return (
      <LogicElement
        types={['Question', 'DataSheet', 'Factor']}
        onChange={this.update}
        logic={displayLogic}
      />
    )
  }

  render () {
    const model = store.displayLogic
    const page = store.displayLogic
    if (!model) { return null }
    const isValid = FillingValidator.run(model)
    return (
      <Modal show dialogClassName={styles.modal} bsSize="large" keyboard={false}>
        <Header>
          <Title>
Display Logic (
            {page.name}
)
          </Title>
        </Header>
        <Body style={{ height: '45vh', overflowY: 'scroll' }}>
          <div>Display this page only if the following condition is met:</div>
          {this.renderConditions()}
        </Body>
        <Footer>
          <button className="btn btn-success" disabled={!isValid} onClick={this.save}>Save</button>
          <button className="btn btn-danger" onClick={this.close}>Close</button>
        </Footer>
      </Modal>
    )
  }
}
