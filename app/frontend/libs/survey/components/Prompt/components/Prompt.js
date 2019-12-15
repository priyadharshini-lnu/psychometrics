import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Modal } from 'react-bootstrap'

const {
  Header, Body, Footer, Title,
} = Modal

export class Prompt extends Component {
  static propTypes = {
    show: PropTypes.bool.isRequired,
    title: PropTypes.string,
    confirm: PropTypes.string,
    cancel: PropTypes.string,
    onConfirm: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    children: PropTypes.node.isRequired,
  }

  state = {
    value: '',
  }

  componentDidUpdate () {
    const { show } = this.props
    if (show && this.input) {
      this.input.focus()
    }
  }

  change = (e) => {
    this.setState({ value: e.currentTarget.value })
  }

  confirm = () => {
    const { onConfirm } = this.props
    const { value } = this.state
    onConfirm(value)
  }

  render () {
    const {
      show, title, children, confirm, onCancel, cancel,
    } = this.props
    const { value } = this.state
    return (
      <Modal show={show} keyboard={false}>
        <Header>
          <Title>{title || 'Confirm'}</Title>
        </Header>
        <Body>
          {children}
          <input
            ref={(ref) => { this.input = ref }}
            className="form-control"
            type="text"
            value={value}
            onChange={this.change}
          />
        </Body>
        <Footer>
          <button className="btn btn-success" onClick={this.confirm}>{confirm || 'Copy'}</button>
          <button className="btn btn-danger" onClick={onCancel}>{cancel || 'Cancel'}</button>
        </Footer>
      </Modal>
    )
  }
}

export default Prompt
