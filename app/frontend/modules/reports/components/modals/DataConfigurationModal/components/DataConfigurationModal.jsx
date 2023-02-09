import { Component } from 'react'
import yaml from 'js-yaml'
import { Modal } from 'react-bootstrap'
import AppStore from '~/modules/reports/store/AppStore'

const { Header } = Modal
const { Body } = Modal
const { Footer } = Modal
const { Title } = Modal

export default class DataConfigurationModal extends Component {
  constructor (props) {
    super(props)
    this.state = {
      dataConfiguration: yaml.dump(AppStore.report.data_configuration),
    }
  }

  handleChangeValue = (event) => {
    this.setState({ dataConfiguration: event.currentTarget.value })
  }

  save = () => {
    const { close } = this.props
    const { dataConfiguration } = this.state
    AppStore.report.syncDataConfiguration(dataConfiguration, () => {
      close()
    })
  }

  render () {
    const { close } = this.props
    const { dataConfiguration } = this.state
    return (
      <Modal show keyboard={false} bsSize="lg">
        <Header>
          <Title>Data Report Configuration</Title>
        </Header>
        <Body>
          <textarea
            ref={(ref) => { this.textarea = ref }}
            className="form-control"
            value={dataConfiguration}
            onChange={this.handleChangeValue}
            rows="10"
            style={{ width: '100%', display: 'inline-block' }}
          />
        </Body>
        <Footer>
          <button className="btn btn-success" onClick={this.save}>Save</button>
          <button className="btn btn-danger" onClick={close}>Cancel</button>
        </Footer>
      </Modal>
    )
  }
}
