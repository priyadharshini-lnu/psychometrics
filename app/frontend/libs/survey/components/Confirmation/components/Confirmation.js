import React from 'react'
import { Modal } from 'react-bootstrap'

const {
  Header, Body, Footer, Title,
} = Modal
const Confirmation = ({
  show, title, children, onConfirm, onCancel, confirm, cancel,
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

export default Confirmation
