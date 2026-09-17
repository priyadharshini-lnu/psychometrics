import _ from 'lodash'
import { Component } from 'react'
import { Modal } from 'react-bootstrap'
import Async from 'react-select/async'
import Block from '~/modules/survey/models/Block'
import Question from '~/modules/survey/models/Question'

const {
  Header, Body, Footer, Title,
} = Modal


export class CreateByTemplate extends Component {
  state = {
    template: null,
  }

  createQuestion = () => {
    const {
      addQuestion, block, assessmentId, fetchQuestionTemplate,
    } = this.props
    const { template } = this.state

    if (template) {
      this.close()
      fetchQuestionTemplate(assessmentId, template.value).then(({ response }) => {
        addQuestion(block, response)
      })
    }
  }

  createBlock = () => {
    const {
      createBlock, createQuestions, position, assessmentId, fetchBlockTemplate,
    } = this.props
    const { template } = this.state
    if (template) {
      fetchBlockTemplate(assessmentId, template.value).then(({ response }) => {
        const block = new Block(Object.assign(response, { position }))
        const questions = block.questions.map(q => new Question(q))
        block.questions = _.map(questions, 'id')
        createBlock(block)
        createQuestions(questions)
        this.close()
      })
    }
  }

  close = () => {
    const { close } = this.props
    this.setState({ template: null })
    close()
  }

  save = () => {
    const { entityName } = this.props
    const method = `create${entityName}`
    this[method]()
  }

  loadOptions = (input) => {
    const {
      entityName, ownerId, assessmentId, fetchBlockTemplates, fetchQuestionTemplates,
    } = this.props
    if (entityName === 'Block') {
      return fetchBlockTemplates(assessmentId, { q: input, owner_id: ownerId }).then(({ response }) => response)
    }
    return fetchQuestionTemplates(assessmentId, { q: input }).then(({ response }) => response)
  }

  changeSelectValue = (template) => {
    this.setState({ template })
  }

  render () {
    const { entityName } = this.props
    const { template } = this.state
    return (
      <Modal show keyboard={false}>
        <Header>
          <Title>
            Copy
            {' '}
            {_.capitalize(entityName)}
            {' '}
            From Template
          </Title>
        </Header>
        <Body>
          <Async
            cacheOptions
            value={template}
            defaultOptions
            loadOptions={this.loadOptions}
            onChange={this.changeSelectValue}
            backspaceRemoves={false}
            autosize={false}
          />
        </Body>
        <Footer>
          <button className="btn btn-success" onClick={this.save}>Save</button>
          <button className="btn btn-danger" onClick={this.close}>Cancel</button>
        </Footer>
      </Modal>
    )
  }
}

export default CreateByTemplate
