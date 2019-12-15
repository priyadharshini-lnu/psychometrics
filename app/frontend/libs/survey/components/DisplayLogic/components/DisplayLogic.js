import React, { Component } from 'react'
import store from 'store/DisplayLogicStore'
import { Modal } from 'react-bootstrap'
import LogicElement from 'components/LogicElement'
import styles from './DisplayLogic.scss'

const {
  Header, Body, Footer, Title,
} = Modal

export default class extends Component {
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

  render () {
    const model = store.question
    const { logicElement } = store
    if (!model) { return null }
    return (
      <Modal show dialogClassName={styles.modal} bsSize="large" keyboard={false}>
        <Header>
          <Title>
Display Logic (
            {model.name}
)
          </Title>
        </Header>
        <Body style={{ height: '45vh', overflowY: 'scroll' }}>
          <div>Display this Question only if the following condition is met:</div>
          <LogicElement
            types={[
              'Question', 'DeviceType', 'EmbeddedData', 'GeoIP',
              'SubjectDataSheet', 'EvaluatorDataSheet', 'EvaluatorRelationship',
            ]}
            logic={logicElement}
            onChange={this.update}
          />
        </Body>
        <Footer>
          <button className="btn btn-success" onClick={this.save}>Save</button>
          <button className="btn btn-danger" onClick={this.close}>Close</button>
        </Footer>
      </Modal>
    )
  }
}
