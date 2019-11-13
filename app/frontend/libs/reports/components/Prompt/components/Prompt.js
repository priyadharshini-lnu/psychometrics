import React, { Component } from 'react'
import { Modal } from 'react-bootstrap'
import store from 'rb/store/PromptStore'
import styles from './Prompt.scss'

const { Header } = Modal
const { Body } = Modal
const { Footer } = Modal
const { Title } = Modal

export class Prompt extends Component {
  state = {
    value: '',
  }

  componentDidMount () {
    this.storeListener = store.addListener('change', () => this.forceUpdate())
  }

  componentDidUpdate () {
    if (store.show && this.input) {
      this.input.focus()
    }
  }

  componentWillUnmount () {
    this.storeListener.remove()
  }

  change = (e) => {
    this.setState({ value: e.currentTarget.value })
  }

  cancel = () => {
    store.close()
  }

  save = () => {
    const { value } = this.state
    store.save(value)
    this.setState({ value: '' })
  }

  render () {
    const { value } = this.state
    const { show } = store
    if (!show) { return null }

    return (
      <Modal show keyboard={false} className={styles.dialog}>
        <Header>
          <Title>Change Label</Title>
        </Header>
        <Body>
          Type new value for label:
          <input
            ref={(ref) => { this.input = ref }}
            className="form-control"
            type="text"
            value={value}
            onChange={this.change}
          />
        </Body>
        <Footer>
          <button className="btn btn-success" onClick={this.save}>Save</button>
          <button className="btn btn-danger" onClick={this.cancel}>Cancel</button>
        </Footer>
      </Modal>
    )
  }
}

export default Prompt
