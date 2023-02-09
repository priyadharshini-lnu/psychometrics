import { Component } from 'react'
import _ from 'lodash'
import { Modal } from 'react-bootstrap'
import AppStore from '~/modules/reports/store/AppStore'
import styles from './ConditionalImageModal.less'

const {
  Header, Body, Footer, Title,
} = Modal

export class ConditionalImageModal extends Component {
  constructor (props) {
    super(props)
    this.state = {
      model: _.cloneDeep(props.model),
    }
  }

  save = () => {
    const { model: newModule } = this.state
    const { model, close } = this.props
    model.props = newModule.props
    model.update()
    close()
  }

  changeTopPosition = (e) => {
    const { model } = this.state
    model.props.topPosition = parseInt(e.currentTarget.value, 10)
    this.forceUpdate()
  }

  changeBasedOn = (e) => {
    const { model: { props } } = this.state
    props.basedOn = e.currentTarget.value
    props.topPosition = 1
    this.forceUpdate()
  }

  renderTopPositionSelect () {
    const { model, model: { props } } = this.state
    if (!props.topPosition) { props.topPosition = 1 }
    const assessment = _.find(AppStore.assessments, { id: model.assessment_id })
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
    const { model: { props } } = this.state
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
    const { model } = this.state
    const { close } = this.props
    return (
      <Modal show keyboard={false} bsSize="lg" dialogClassName={styles.modal}>
        <Header>
          <Title>
            Conditional
            {model.type}
          </Title>
        </Header>
        <Body>
          {this.renderFactorsOrOccupationsSelect()}
          {this.renderTopPositionSelect()}
        </Body>
        <Footer>
          <button className="btn btn-success" onClick={this.save}>Save</button>
          <button className="btn btn-danger" onClick={close}>Cancel</button>
        </Footer>
      </Modal>
    )
  }
}

export default ConditionalImageModal
