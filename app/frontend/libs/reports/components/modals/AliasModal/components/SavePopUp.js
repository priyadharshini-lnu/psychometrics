import React, { Component } from 'react'
import { Modal } from 'react-bootstrap'
import store from 'rb/store/modals/AliasStore'
import AppStore from 'rb/store/AppStore'
import styles from './AliasModal.scss'

const {
  Header, Body, Footer, Title,
} = Modal

export class SavePopUp extends Component {
  componentDidMount () {
    this.popupListener = store.addListener('savePopUpChange', () => this.forceUpdate())
  }

  componentWillUnmount () {
    this.popupListener.remove()
  }

  overrideZIndex = () => {
    // eslint-disable-next-line no-underscore-dangle
    // TODO: Find a fix, refs are empty after react upgrade
    // this.modal._modal.refs.backdrop.style.zIndex = 10000
  }

  close () {
    store.closeSavePopUp()
  }

  save (e) {
    const target = e.currentTarget
    target.setAttribute('disabled', 'disabled')
    store.save(() => {
      AppStore.save(() => { window.location.reload() })
    })
  }

  render () {
    if (!store.savePopUp) { return null }
    return (
      <Modal
        ref={(ref) => { this.modal = ref }}
        show
        keyboard={false}
        bsSize="lg"
        dialogClassName={styles.modal}
        onEntered={this.overrideZIndex}
        className={styles.secondModal}
      >
        <Header>
          <Title>Save</Title>
        </Header>
        <Body>
          <h4>
            If you wish to save ALL changes in Report Builder and also in Aliases, please click ‘SAVE’ button.
            The page will be reloaded and your changes will be successfully applied.
          </h4>
        </Body>
        <Footer>
          <button className="btn btn-success" onClick={this.save}>Save</button>
          <button className="btn btn-danger" onClick={this.close}>Cancel</button>
        </Footer>
      </Modal>
    )
  }
}

export default SavePopUp
