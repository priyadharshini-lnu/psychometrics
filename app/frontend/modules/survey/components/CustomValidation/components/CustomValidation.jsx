import { Component } from 'react'
import _ from 'lodash'
import { Modal } from 'react-bootstrap'
import { v4 as uuid } from 'uuid'
import ConditionList from './ConditionList'
import Condition from '../../../models/QuestionCondition'
import styles from './CustomValidation.less'

const { Header } = Modal
const { Body } = Modal
const { Footer } = Modal
const { Title } = Modal

export class CustomValidation extends Component {
  state = {
    errors: [],
    validations: [],
  }

  componentDidMount () {
    const { question } = this.props
    if (!question.validation.customValidations?.length) {
      this.setState({
        validations: [{
          uuid: uuid(),
          conditions: [new Condition({ subject: question.id })],
          message: '',
        }],
      })
    } else {
      const validations = _.cloneDeep(question.validation.customValidations)
      this.setState({ validations })
    }
  }

  save = () => {
    const { question, close } = this.props
    const { validations } = this.state
    const missingMessages = validations.filter(v => !v.message).map(v => v.uuid)
    this.setState({ errors: missingMessages })
    if (missingMessages.length === 0) {
      question.validation.customValidations = validations
      question.update()
      close()
    }
  }


  cancel = () => {
    const { question, close } = this.props
    if (!question.validation.customValidations.length) {
      question.validation.type = 'None'
      question.update()
    }
    this.setState({ errors: [] })
    close()
  }

  changeErrorText = (validation, e) => {
    validation.message = e.currentTarget.value
    this.forceUpdate()
  }

  addValidation = () => {
    const { validations } = this.state
    const { question } = this.props
    this.setState({
      validations: [
        ...validations,
        {
          uuid: uuid(),
          conditions: [new Condition({ subject: question.id })],
          message: '',
        },
      ],
    })
    this.forceUpdate()
  }

  removeValidation = (validation) => {
    const { validations } = this.state
    this.setState({
      validations: _.filter(
        validations, v => v.uuid !== validation.uuid,
      ),
    })
  }

  renderConditions (validation, key) {
    const { errors } = this.state
    return (
      <div className={styles.panel} key={key}>
        <div className={`btn fa fa-close ${styles.remove}`} onClick={() => this.removeValidation(validation)} />
        <div>Validation will pass if the following condition is met:</div>
        <ConditionList validation={validation} {...this.props} />
        <div className={`${styles.errMessage} ${errors.includes(validation.uuid) ? styles.error : ''}`}>
          Type an error message to display on failure:
        </div>
        <input
          type="text"
          className="form-control"
          value={validation.message}
          onChange={e => this.changeErrorText(validation, e)}
        />
      </div>
    )
  }

  render () {
    const { validations } = this.state
    return (
      <Modal show bsSize="lg" keyboard={false}>
        <Header>
          <Title>Choice Text</Title>
        </Header>
        <Body>
          {validations && validations.map((validation, i) => this.renderConditions(validation, i))}
          <div className={styles.constrols}>
            <button className="btn btn-success" onClick={this.addValidation}>Add Validation</button>
          </div>
        </Body>
        <Footer>
          <button className="btn btn-success" onClick={this.save}>Save</button>
          <button className="btn btn-danger" onClick={this.cancel}>Cancel</button>
        </Footer>
      </Modal>
    )
  }
}

export default CustomValidation
