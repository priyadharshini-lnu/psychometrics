import _ from 'lodash'
import { Component } from 'react'
import { Modal } from 'react-bootstrap'
import InnovationStyleConditionCollection from '~/modules/reports/models/InnovationStyleConditionCollection'
import styles from './InnovationStyleConditionModal.less'
import ConditionCollection from './ConditionCollection'

const { Header } = Modal
const { Body } = Modal
const { Footer } = Modal
const { Title } = Modal

const { $ } = window

export class ConditionalTextModal extends Component {
  constructor (props) {
    super(props)
    this.state = {
      module: _.cloneDeep(props.module),
    }
  }

  addCollection = () => {
    const { module } = this.state
    const max = _.maxBy(module.textConditions, 'id') || { id: 0 }
    module.addConditionCollection(new InnovationStyleConditionCollection(
      { id: max.id + 1, conditions: [{ type: 'Scoring' }] }, module,
    ))
    this.forceUpdate()
  }

  save = () => {
    const { module: newModule } = this.state
    const { module, close } = this.props
    module.textConditions = newModule.textConditions
    module.update()
    close()
  }

  remove = (collection) => {
    const { module } = this.state
    module.removeConditionCollection(collection)
    this.forceUpdate()
  }

  removeIndex () {
    $(".modal[tabindex='-1']").removeAttr('tabindex')
  }

  renderCollections () {
    const { module } = this.state
    if (module.textConditions.length) {
      return _.map(module.textConditions, (collection, i) => (
        <ConditionCollection key={i} model={collection} onRemove={this.remove} />
      ))
    }
    return (
      <div>No conditions</div>
    )
  }

  render () {
    const { close } = this.props
    return (
      <Modal onEntered={this.removeIndex} show keyboard={false} bsSize="lg" dialogClassName={styles.modal}>
        <Header>
          <Title>Innovation Style Conditions</Title>
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
            Add Condition
          </button>
          <button className="btn btn-success" onClick={this.save}>Save</button>
          <button className="btn btn-danger" onClick={close}>Cancel</button>
        </Footer>
      </Modal>
    )
  }
}

export default ConditionalTextModal
