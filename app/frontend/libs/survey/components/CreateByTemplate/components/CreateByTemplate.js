import _ from 'lodash'
import React, { Component } from 'react'
import { Modal } from 'react-bootstrap'
import Async from 'react-select/async'
import { perform } from 'libs/survey/core/temp/socket'
import Block from 'models/Block'
import Question from 'models/Question'

const {
  Header, Body, Footer, Title,
} = Modal


export class CreateByTemplate extends Component {
  state = {
    template: null,
  }

  createQuestion = () => {
    const { addQuestion, block } = this.props
    const { template } = this.state

    if (template) {
      perform('question_create_by_template', {
        block_id: block.id,
        template_id: template.value,
      }, (templateData) => {
        addQuestion(block, templateData)
      })
      this.close()
    }
  }

  createBlock = () => {
    const {
      createBlock, createQuestions, position,
    } = this.props
    const { template } = this.state
    if (template) {
      perform('block_create_by_template', {
        template_id: template.value,
        position_before: position,
      }, (templateData) => {
        const block = new Block(Object.assign(templateData, { position }))
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

  loadOptions = (input, callback) => {
    const { entityName } = this.props
    perform(`${entityName.toLowerCase()}_filter`,
      { q: input, without_notification: true }, (data) => {
        callback(data)
      })
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
