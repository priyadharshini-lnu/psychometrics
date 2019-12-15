import React, { Component } from 'react'
import { Modal } from 'react-bootstrap'
import store from 'rb/store/modals/ConditionImageStore'
import AppStore from 'rb/store/AppStore'
import styles from './ConditionalImageModal.scss'

const {
  Header, Body, Footer, Title,
} = Modal

export class ConditionalImageModal extends Component {
  componentDidMount () {
    this.popupListener = store.addListener('change', () => this.forceUpdate())
  }

  componentWillUnmount () {
    this.popupListener.remove()
  }

  close = () => {
    store.close()
  }

  save = () => {
    store.save()
  }

  changeTopPosition = (e) => {
    store.module.props.topPosition = parseInt(e.currentTarget.value, 10)
    store.update()
  }

  changeBasedOn = (e) => {
    const { props } = store.module
    props.basedOn = e.currentTarget.value
    props.topPosition = 1
    store.update()
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
        <label>Icon</label>
        <select onChange={this.changeBasedOn} value={props.basedOn} className="form-control">
          <optgroup label="Subfactor">
            <option value="factor">Icon</option>
          </optgroup>
          <optgroup label="Occupation">
            <option value="occupation">Icon</option>
            <option value="occupation_alternative_icon">Alternative icon</option>
            <option value="occupation_indicative_roles_image">Indicative roles image</option>
            <option value="occupation_key_career_tracks_image">Key career tracks image</option>
          </optgroup>
        </select>
      </div>
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
          {this.renderFactorsOrOccupationsSelect()}
          {this.renderTopPositionSelect()}
        </Body>
        <Footer>
          <button className="btn btn-success" onClick={this.save}>Save</button>
          <button className="btn btn-danger" onClick={this.close}>Cancel</button>
        </Footer>
      </Modal>
    )
  }
}

export default ConditionalImageModal
