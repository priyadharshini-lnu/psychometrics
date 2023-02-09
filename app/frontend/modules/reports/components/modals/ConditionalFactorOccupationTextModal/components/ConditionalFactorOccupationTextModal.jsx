import _ from 'lodash'
import { Component } from 'react'
import { Modal } from 'react-bootstrap'
import AppStore from '~/modules/reports/store/AppStore'
import CPIConditionCollection from '~/modules/reports/models/CPIConditionCollection'
import styles from './CPIFactorConditionModal.less'
import ConditionCollection from './ConditionCollection'
import DefaultValues from './DefaultValues'

const { $ } = window

const {
  Header, Body, Footer, Title,
} = Modal

export class ConditionalTextModal extends Component {
  constructor (props) {
    super(props)
    this.state = {
      module: _.cloneDeep(props.module),
    }
  }

  addCollection = () => {
    const { module } = this.state
    const max = _.maxBy(AppStore.report.filters, 'id') || { id: 0 }
    module.addConditionCollection(new CPIConditionCollection(
      { id: max.id + 1, styles: {}, conditions: [{ type: 'Scoring' }] }, module,
    ))
    this.forceUpdate()
  }

  save = () => {
    const { module: newModule } = this.state
    if (newModule.props.basedOn === 'occupation') { newModule.textConditions = [] }
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

  changeTopPosition = (e) => {
    const { module: { props } } = this.state
    props.topPosition = parseInt(e.currentTarget.value, 10)
    this.forceUpdate()
  }

  changeBasedOn = (e) => {
    const { module: { props } } = this.state
    props.basedOn = e.currentTarget.value
    props.topPosition = 1
    props.fieldName = 'name'
    this.forceUpdate()
  }

  changeFieldName = (e) => {
    const { module: { props } } = this.state
    props.fieldName = e.currentTarget.value
    this.forceUpdate()
  }

  fieldsCollection = () => {
    const { module: { props } } = this.state
    const fieldNames = DefaultValues.fieldNames[props.basedOn]
    return _.map(fieldNames, (value, key) => <option value={key} key={value}>{value}</option>)
  }

  removeIndex () {
    $(".modal[tabindex='-1']").removeAttr('tabindex')
  }

  renderCollections () {
    const { module, module: { props } } = this.state
    if (props.basedOn === 'occupation') { return null }
    if (module.textConditions.length) {
      return _.map(module.textConditions, (collection, i) => (
        <ConditionCollection key={i} model={collection} />
      ))
    }
    return (
      <div>No conditions</div>
    )
  }

  renderTopPositionSelect () {
    const { module, module: { props } } = this.state
    if (!props.topPosition) { props.topPosition = 1 }
    const assessment = _.find(AppStore.assessments, { id: module.assessment_id })
    const dimensionId = assessment && assessment.dimensionId
    if (!dimensionId) { return null }
    const max = props.basedOn === 'factor'
      ? AppStore.subfactors[dimensionId].length
      : AppStore.occupations[dimensionId].length
    return (
      <div className="form-group">
        <label>Position</label>
        <select onChange={this.changeTopPosition} value={props.topPosition} className="form-control">
          {_.times(max, i => <option value={i + 1} key={i + 1}>{i + 1}</option>)}
        </select>
      </div>
    )
  }

  renderFactorsOrOccupationsSelect () {
    const { module: { props } } = this.state
    if (!props.basedOn) { props.basedOn = 'factor' }
    return (
      <div className="form-group">
        <label>Based on</label>
        <select onChange={this.changeBasedOn} value={props.basedOn} className="form-control">
          <option value="factor">Subfactor</option>
          <option value="occupation">Occupation</option>
        </select>
      </div>
    )
  }

  renderFieldNameSelect () {
    const { module: { props } } = this.state
    return (
      <div className="form-group">
        <label>Conditional text</label>
        <select onChange={this.changeFieldName} value={props.fieldName} className="form-control">
          {this.fieldsCollection()}
        </select>
      </div>
    )
  }


  render () {
    const { module: { props } } = this.state
    const { close } = this.props
    return (
      <Modal onEntered={this.removeIndex} show keyboard={false} bsSize="lg" dialogClassName={styles.modal}>
        <Header>
          <Title>Conditional Subfactor / Occupation Text</Title>
        </Header>
        <Body>
          {this.renderFactorsOrOccupationsSelect()}
          {this.renderTopPositionSelect()}
          {this.renderFieldNameSelect()}
          {this.renderCollections()}
        </Body>
        <Footer>
          {props.basedOn === 'factor'
            && (
            <button
              className="btn btn-default"
              style={{ float: 'left' }}
              onClick={this.addCollection}
            >
              Add Conditional Subfactor
            </button>
            )}
          <button className="btn btn-success" onClick={this.save}>Save</button>
          <button className="btn btn-danger" onClick={close}>Cancel</button>
        </Footer>
      </Modal>
    )
  }
}

export default ConditionalTextModal
