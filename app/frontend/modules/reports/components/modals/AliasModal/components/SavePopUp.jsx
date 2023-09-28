import { Component } from 'react'
import _ from 'lodash'
import { Modal } from 'react-bootstrap'
import { connect } from 'react-redux'
import AppStore from '~/modules/reports/store/AppStore'
import { closeModal, getData } from '~/modules/admin/core/ui/modals'
import styles from './AliasModal.less'

const {
  Header, Body, Footer, Title,
} = Modal

export class SavePopUp extends Component {
  overrideZIndex = () => {
    // eslint-disable-next-line no-underscore-dangle
    // TODO: Find a fix, refs are empty after react upgrade
    // this.modal._modal.refs.backdrop.style.zIndex = 10000
  }

  save = (e) => {
    const { factors } = this.props
    const target = e.currentTarget
    target.setAttribute('disabled', 'disabled')
    AppStore.report.syncAliases(_.map(factors, f => f), () => {
      AppStore.save(() => { window.location.reload() })
    })
  }

  render () {
    const { close } = this.props
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
          <button className="btn btn-danger" onClick={close}>Cancel</button>
        </Footer>
      </Modal>
    )
  }
}


export default connect(
  state => ({
    ...getData(state.report).savePopUp,
  }),
  {
    close: () => closeModal('savePopUp'),
  },
)(SavePopUp)
