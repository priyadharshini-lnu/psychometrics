import _ from 'lodash'
import { Component } from 'react'
import { Modal } from 'react-bootstrap'
import { Space, Switch } from 'antd'
import TextConditionCollection from '~/modules/reports/models/TextConditionCollection'
import AppStore from '~/modules/reports/store/AppStore'
import styles from './ConditionalTextModal.less'
import ConditionCollection from './ConditionCollection'

const { $ } = window

const {
  Header, Body, Footer, Title,
} = Modal

export class ConditionalTextModal extends Component {
  constructor (props) {
    super(props)
    this.state = {
      module: _.cloneDeep(props.modules[0]),
      skipRoundingValues: props.modules[0].props.skipRoundingValues || false,
    }
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

  addCollection = () => {
    const { module } = this.state
    const max = _.maxBy(AppStore.report.filters, 'id') || { id: 0 }
    module.addConditionCollection(new TextConditionCollection(
      { id: max.id + 1, conditions: [{ props: {} }] }, module,
    ))
    this.forceUpdate()
  }

  save = () => {
    const { module: newModule, skipRoundingValues } = this.state
    const { modules, close } = this.props
    modules.forEach((m) => {
      m.textConditions = newModule.textConditions
      m.props.skipRoundingValues = skipRoundingValues
      m.update()
    })

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
    const { module, skipRoundingValues } = this.state
    return (
      <Modal onEntered={this.removeIndex} show keyboard={false} bsSize="lg" dialogClassName={styles.modal}>
        <Header>
          <Title>
            Conditional
            {module.type}
          </Title>
        </Header>
        <Body>
          {this.renderCollections()}
          <Space>
            <Switch
              checked={skipRoundingValues}
              onChange={() => this.setState({ skipRoundingValues: !skipRoundingValues })}
            />
            Skip Rounding Values
          </Space>
        </Body>
        <Footer>
          <button className="btn btn-default" style={{ float: 'left' }} onClick={this.addCollection}>
            Add
            {' '}
            {this.getBtnLabel(module.type)}
          </button>
          <button className="btn btn-success" onClick={this.save}>Save</button>
          <button className="btn btn-danger" onClick={close}>Cancel</button>
        </Footer>
      </Modal>
    )
  }
}

export default ConditionalTextModal
