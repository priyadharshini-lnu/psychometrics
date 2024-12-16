import _ from 'lodash'
import { Component } from 'react'
import { Modal } from 'react-bootstrap'
import { Alert } from 'antd'
import NotificationDispatcher from '~/modules/survey/dispatchers/NotificationDispatcher'
import styles from './Randomization.less'

const {
  Header, Body, Footer, Title,
} = Modal

const { I18n } = window

export class Randomization extends Component {
  state = {}

  componentDidMount = () => {
    const { model } = this.props
    if (model) {
      this.setState({
        type: model.props.randomization.type,
        questions: model.props.randomization.questions || '',
        perPage: model.props.randomization.perPage || '',
      })
    }
  }

  handleChangeType = (e) => {
    this.setState({ type: e.currentTarget.value })
  }

  handleChangeQuestions = (e) => {
    this.setState({ questions: Math.abs(parseInt(e.currentTarget.value, 10)) || '' })
  }

  handleChangePerPage = (e) => {
    this.setState({ perPage: Math.abs(parseInt(e.currentTarget.value, 10)) || '' })
  }

  save = () => {
    const {
      entityName, model, close, updateBlockProps, enableSingleQuestionPage,
      toggleSingleQuestionPage  
    } = this.props
    const { type, questions, perPage } = this.state
    if (enableSingleQuestionPage && type === 'ByFactors' && perPage && perPage > 1) {
      toggleSingleQuestionPage()
    }
    if (type === 'Some' && !questions) {
      NotificationDispatcher.notify({ level: 'error', message: 'You must enter a value' })
    }
    else {
      if (entityName === 'choice') {
        model.props.randomization = this.state
        model.update()
      } else {
        updateBlockProps(model, { randomization: this.state })
      }
      close()
    }
  }

  render () {
    const {
      close, entityName, enableSingleQuestionPage,
    } = this.props
    const { type, questions, perPage } = this.state
    return (
      <Modal show keyboard={false}>
        <Header>
          <Title>
            {_.capitalize(entityName)}
            {' '}
            {I18n.t('administration.assessments.randomization.title')}
          </Title>
        </Header>
        <Body>
          {enableSingleQuestionPage && (
          <Alert
            className="mb-2"
            message={I18n.t('administration.assessments.randomization.single_question_page_warning')}
            type="warning"
            banner
          />
          )}
          <label className={styles.inputLabel}>
            <input
              checked={type === 'No'}
              type="radio"
              value="No"
              onChange={this.handleChangeType}
            />
            {' '}
            {I18n.t('administration.assessments.randomization.no_randomization')}
          </label>
          <label className={styles.inputLabel}>
            <input
              checked={type === 'All'}
              type="radio"
              value="All"
              onChange={this.handleChangeType}
            />
            {' '}
            {I18n.t('administration.assessments.randomization.no_randomization_order_all')}
            {' '}
            {I18n.t(`administration.assessments.randomization.plural.${entityName}`)}
          </label>
          <label className={styles.inputLabel}>
            <input
              checked={type === 'Some'}
              type="radio"
              value="Some"
              onChange={this.handleChangeType}
            />
            {' '}
            {I18n.t('administration.assessments.randomization.present_only')}
            <input
              value={type === 'Some' ? questions : undefined}
              onChange={this.handleChangeQuestions}
              className={styles.questionInput}
              disabled={type !== 'Some'}
            />
            {I18n.t('administration.assessments.randomization.of_total')}
            {' '}
            {I18n.t(`administration.assessments.randomization.plural.${entityName}`)}

          </label>
          {entityName === 'question' && (
            <label className={styles.inputLabel}>
              <input
                checked={type === 'ByFactors'}
                type="radio"
                value="ByFactors"
                onChange={this.handleChangeType}
              />
              {' '}
              {I18n.t('administration.assessments.randomization.select_only')}
              <input
                value={type === 'ByFactors' ? questions : undefined}
                onChange={this.handleChangeQuestions}
                className={styles.questionInput}
                disabled={type !== 'ByFactors'}
              />
              {I18n.t('administration.assessments.randomization.question_per_factor_and_show')}
              <input
                value={type === 'ByFactors' ? perPage : undefined}
                onChange={this.handleChangePerPage}
                className={styles.questionInput}
                disabled={type !== 'ByFactors'}
              />
              {' '}
              {I18n.t('administration.assessments.randomization.per_page')}
            </label>
          )}
          <label className={styles.inputLabel}>
            <input
              checked={type === 'QuestionsPerPage'}
              type="radio"
              value="QuestionsPerPage" 
              onChange={this.handleChangeType}
            />
            {' '}
            {I18n.t('administration.assessments.randomization.select')}
            <input
              value={type === 'QuestionsPerPage' ? questions : undefined}
              onChange={this.handleChangeQuestions}
              className={styles.questionInput}
              disabled={type !== 'QuestionsPerPage'}
            />
            {I18n.t(`administration.assessments.randomization.plural.${entityName}`)}
            {' '}
            {I18n.t('administration.assessments.randomization.per_page')}
          </label>


        </Body>
        <Footer>
          <button className="btn btn-success" onClick={this.save}>
            {I18n.t('administration.assessments.randomization.save')}
          </button>
          <button className="btn btn-danger" onClick={close}>
            {I18n.t('administration.assessments.randomization.cancel')}
          </button>
        </Footer>
      </Modal>
    )
  }
}

export default Randomization
