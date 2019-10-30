import React from 'react'
import PropTypes from 'prop-types'
import { Modal } from 'react-bootstrap'

const {
  Header, Body, Footer, Title,
} = Modal

const Confirmation = ({
  show, title, children, onCancel, onConfirm, confirm, cancel,
}) => (
  <Modal show={show} keyboard={false}>
    <Header>
      <Title>{title || 'Confirm'}</Title>
    </Header>
    <Body>
      {children}
    </Body>
    <Footer>
      <button className="btn btn-success" onClick={onConfirm}>{confirm || 'Yes'}</button>
      <button className="btn btn-danger" onClick={onCancel}>{cancel || 'No'}</button>
    </Footer>
  </Modal>
)

Confirmation.propTypes = {
  show: PropTypes.bool.isRequired,
  title: PropTypes.string,
  confirm: PropTypes.string,
  cancel: PropTypes.string,
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
}

export default Confirmation
