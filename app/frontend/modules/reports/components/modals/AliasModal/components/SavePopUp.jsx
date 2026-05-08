import { useState } from 'react'
import _ from 'lodash'
import { Modal } from 'react-bootstrap'
import { connect } from 'react-redux'
import AppStore from '~/modules/reports/store/AppStore'
import { closeModal, getData } from '~/modules/admin/core/ui/modals'
import { save } from '~/modules/reports/core/builder/actions'
import styles from './AliasModal.less'

const { I18n } = window
const {
  Header, Body, Footer, Title,
} = Modal

export const SavePopUp = ({
  factors, report, save: saveReport, close,
}) => {
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = () => {
    setIsSaving(true)
    AppStore.report.syncAliases(_.map(factors, f => f), () => {
      saveReport(report).then(() => {
        window.onbeforeunload = null
        window.location.reload()
      }).catch(() => {
        setIsSaving(false)
      })
    })
  }

  return (
    <Modal
      show
      keyboard={false}
      bsSize="lg"
      dialogClassName={styles.modal}
      className={styles.secondModal}
    >
      <Header>
        <Title>{I18n.t('shared.save')}</Title>
      </Header>
      <Body>
        <h4>{I18n.t('admin.report_alias_save_confirmation')}</h4>
      </Body>
      <Footer>
        <button className="btn btn-success" onClick={handleSave} disabled={isSaving}>{I18n.t('shared.save')}</button>
        <button className="btn btn-danger" onClick={close}>{I18n.t('shared.cancel')}</button>
      </Footer>
    </Modal>
  )
}

export default connect(
  state => ({
    ...getData(state.report).savePopUp,
    report: state.report,
  }),
  {
    close: () => closeModal('savePopUp'),
    save,
  },
)(SavePopUp)
