import React, { Component } from 'react'
import { Modal } from 'react-bootstrap'
import LogicElement from 'components/LogicElement'
import styles from './DisplayLogic.scss'

const {
  Header, Body, Footer, Title,
} = Modal

export default class DisplayLogic extends Component {
  save = () => {
    const {
      saveDisplayLogic, question, logicElement, close,
    } = this.props
    saveDisplayLogic(question, logicElement)
    close()
  }

  update = () => {
    this.forceUpdate()
  }

  render () {
    const {
      show, question, logicElement, close,
    } = this.props
    if (!show) { return null }
    return (
      <Modal show dialogClassName={styles.modal} bsSize="large" keyboard={false}>
        <Header>
          <Title>
            Display Logic (
            {question.name}
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
          <button className="btn btn-danger" onClick={() => close()}>Close</button>
        </Footer>
      </Modal>
    )
  }
}
