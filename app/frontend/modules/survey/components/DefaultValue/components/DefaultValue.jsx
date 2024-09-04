import { Component } from 'react'
import { Modal } from 'react-bootstrap'
import { Previews } from '~/modules/survey/components/modules'
import styles from './DefaultValue.less'

const { Header } = Modal
const { Body } = Modal
const { Footer } = Modal
const { Title } = Modal

export default class extends Component {
  constructor (props) {
    super(props)
    this.state = {
      initialAnswers: props.question.result.answers,
    }
  }

  clear = () => {
    const { question } = this.props
    question.resetDefaultValues()
    this.forceUpdate()
  }

  save = () => {
    const { question, close } = this.props
    question.props.defaultValues = question.result.answers
    question.updateDefaultProps()
    close()
  }

  renderModulePreview () {
    const { question } = this.props
    const View = Previews[`${question.type}Preview`]
    return <View model={question} />
  }

  handleClose = () => {
    const { question, close, preview } = this.props
    const { initialAnswers } = this.state
    question.result.answers = initialAnswers
    if (preview.results[question.id]) {
      preview.results[question.id].answers = initialAnswers
    }
    question.update()
    close()
  }

  render () {
    return (
      <Modal show dialogClassName={styles.modal} bsSize="large" keyboard={false}>
        <Header>
          <Title>Edit Default Choices</Title>
        </Header>
        <Body style={{ height: '65vh', overflowY: 'scroll' }}>
          {this.renderModulePreview()}
        </Body>
        <Footer>
          <button className="btn btn-default" style={{ float: 'left' }} onClick={this.clear}>Clear</button>
          <button className="btn btn-success" onClick={this.save}>Save</button>
          <button className="btn btn-danger" onClick={this.handleClose}>Close</button>
        </Footer>
      </Modal>
    )
  }
}
