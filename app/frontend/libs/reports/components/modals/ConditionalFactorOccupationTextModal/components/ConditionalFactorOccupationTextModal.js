import _ from 'lodash'
import React, { Component } from 'react'
import { Modal } from 'react-bootstrap'
import store from 'rb/store/modals/ConditionalFactorOccupationTextStore'
import AppStore from 'rb/store/AppStore'
import styles from './CPIFactorConditionModal.scss'
import ConditionCollection from './ConditionCollection'
import DefaultValues from './DefaultValues'

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

  changeTopPosition = (e) => {
    store.module.props.topPosition = parseInt(e.currentTarget.value, 10)
    store.update()
  }

  changeBasedOn = (e) => {
    const { props } = store.module
    props.basedOn = e.currentTarget.value
    props.topPosition = 1
    props.fieldName = 'name'
    store.update()
  }

  changeFieldName = (e) => {
    store.module.props.fieldName = e.currentTarget.value
    store.update()
  }

  close = () => {
    store.close()
  }

  addCollection = () => {
    store.addCollection()
  }

  save = () => {
    if (store.module.props.basedOn === 'occupation') { store.module.textConditions = [] }
    store.save()
  }

  fieldsCollection = () => {
    const { props } = store.module
    const fieldNames = DefaultValues.fieldNames[props.basedOn]
    return _.map(fieldNames, (value, key) => <option value={key} key={value}>{value}</option>)
  }

  renderCollections () {
    if (store.module.props.basedOn === 'occupation') { return null }
    if (store.module.textConditions.length) {
      return _.map(store.module.textConditions, (collection, i) => (
        <ConditionCollection key={i} model={collection} />
      ))
    }
    return (
      <div>No conditions</div>
    )
  }

  renderTopPositionSelect () {
    const { props } = store.module
    const { module } = store
    if (!props.topPosition) { props.topPosition = 1 }
    const assessment = _.find(AppStore.assessments, { id: module.assessment_id })
    const dimensionId = assessment && assessment.dimensionId
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
    const { props } = store.module
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
    const { props } = store.module
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
    if (!store.opened) { return null }
    return (
      <Modal show keyboard={false} bsSize="lg" dialogClassName={styles.modal}>
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
          {store.module.props.basedOn === 'factor'
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
          <button className="btn btn-danger" onClick={this.close}>Cancel</button>
        </Footer>
      </Modal>
    )
  }
}

export default ConditionalTextModal
