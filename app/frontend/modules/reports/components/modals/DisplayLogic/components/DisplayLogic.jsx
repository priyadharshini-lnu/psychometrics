import { Component } from 'react'
import { Modal } from 'react-bootstrap'
import LogicElement from '~/modules/reports/components/LogicElement'
import LogicElementModel from '~/modules/reports/models/logic/LogicElement'
import FillingValidator from '~/modules/reports/components/LogicElement/FillingValidator'
import styles from './DisplayLogic.less'

const {
  Header, Body, Footer, Title,
} = Modal

export default class DisplayLogic extends Component {
  constructor ({ model }) {
    super()
    this.state = {
      displayLogic: model.displayLogic || new LogicElementModel({}),
    }
  }

  save = () => {
    const { model, close, saveDisplayLogic } = this.props
    const { displayLogic } = this.state
    saveDisplayLogic(model.id, displayLogic)
    close()
  }

  update = () => {
    this.forceUpdate()
  }

  renderConditions = () => {
    const { factors, assessments } = this.props
    const { displayLogic } = this.state

    return (
      <LogicElement
        types={['Question', 'DataSheet', 'Factor', 'Assessment']}
        onChange={this.update}
        logic={displayLogic}
        factors={factors}
        assessments={assessments}
      />
    )
  }

  render () {
    const { model, close } = this.props
    if (!model) { return null }
    const isValid = FillingValidator.run(model)
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
          <div>Display this page only if the following condition is met:</div>
          {this.renderConditions()}
        </Body>
        <Footer>
          <button className="btn btn-success" disabled={!isValid} onClick={this.save}>Save</button>
          <button className="btn btn-danger" onClick={close}>Close</button>
        </Footer>
      </Modal>
    )
  }
}
