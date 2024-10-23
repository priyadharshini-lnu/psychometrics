import _ from 'lodash'
import { Component } from 'react'
import {
  Modal,
  Button
} from 'antd'
import CPIConditionCollection from '~/modules/reports/models/CPIConditionCollection'
import styles from './CampaignFactorConditionModal.less'
import ConditionCollection from './ConditionCollection'
const { $, I18n } = window



export class ConditionalTextModal extends Component {
  constructor (props) {
    super(props)
    this.state = {
      module: _.cloneDeep(props.modules[0]),
    }
  }

  addCollection = () => {
    const { module } = this.state
    const max = _.maxBy(module.textConditions, 'id') || { id: 0 }
    module.addConditionCollection(new CPIConditionCollection(
      { id: max.id + 1, conditions: [{ type: 'Scoring' }] }, module,
    ))
    this.forceUpdate()
  }

  save = () => {
    const { module: newModule } = this.state
    const { modules, close } = this.props
    modules.forEach((module) => {
      module.textConditions = newModule.textConditions
      module.update()
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
      <div>{I18n.t('reports.modules.campaign_factors_table.no_conditions')}</div>
    )
  }

  render () {
    const { close } = this.props
    return (
      <Modal 
        open
        title={I18n.t('reports.modules.campaign_factors_table.campaign_factor_conditions')} 
        keyboard={false} 
        onCancel={this.props.close} 
        className={styles.modal}
        width="lg"
        footer={[
          <Button className="btn btn-default" style={{ float: 'left' }} key="1" onClick={this.addCollection}>
         { I18n.t('reports.modules.campaign_factors_table.add_condition')}
          </Button>,
          <Button className="btn btn-success" onClick={this.save} key="2">{I18n.t('reports.modules.campaign_factors_table.save')}</Button>,
          <Button className="btn btn-danger" onClick={close} key="3"> { I18n.t('reports.modules.campaign_factors_table.cancel')}</Button>
        ]}
      >
        {this.renderCollections()}
      </Modal>
    )
  }
}

export default ConditionalTextModal
