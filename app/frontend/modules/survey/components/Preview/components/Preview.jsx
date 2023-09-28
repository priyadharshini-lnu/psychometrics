import { Component } from 'react'
import { Modal } from 'react-bootstrap'
import { Previews } from '~/modules/survey/components/modules'
import styles from './Preview.less'
// var {Header, Body, Footer, Title} = Modal

const {
  Header, Body, Footer, Title,
} = Modal

export default class Preview extends Component {
  close = () => {
    const { question, close } = this.props
    question.resetResult()
    close()
  }

  renderModulePreview () {
    const { question } = this.props
    const View = Previews[`${question.type}Preview`]
    return <View model={question} />
  }

  render () {
    return (
      <Modal show dialogClassName={styles.modal} bsSize="large" keyboard={false}>
        <Header>
          <Title>Preview Question</Title>
        </Header>
        <Body style={{ height: '65vh', overflowY: 'scroll' }}>
          {this.renderModulePreview()}
        </Body>
        <Footer>
          <button className="btn btn-danger" onClick={this.close}>Close</button>
        </Footer>
      </Modal>
    )
  }
}
