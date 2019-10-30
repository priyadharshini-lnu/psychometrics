import React, { Component } from 'react'
import { Modal } from 'react-bootstrap'
import store from 'rb/store/modals/DataSheetModalStore'
import AppStore from 'rb/store/AppStore'
import { DATA_SHEET_COLUMN_TYPES } from 'rb/models/Report'
import styles from './DataSheetModal.module.scss'
import Column from './Column'

const { $ } = window
const {
  Header, Body, Footer, Title,
} = Modal

export default class DataSheetModal extends Component {
  state = { file: null }

  componentDidMount () {
    this.popupListener = store.addListener('change', () => this.forceUpdate())
  }

  componentWillUnmount () {
    this.popupListener.remove()
  }

  onChangeFile = ({ target }) => {
    this.setState({ file: target.files[0] })
  }

  sendFile = () => {
    const { file } = this.state
    if (!file) return null
    const data = new FormData()
    data.append('file', file, file.name)
    $.ajax({
      url: `/administration/reports/${AppStore.report.id}/upload_data_sheet`,
      data,
      cache: false,
      contentType: false,
      processData: false,
      method: 'POST',
      success (data) {
        store.updateColumns(data)
      },
    })
  }

  close = () => store.close()

  save = () => store.save()

  addColumn = () => store.add({ type: DATA_SHEET_COLUMN_TYPES[0] })

  updateColumn = (index, fieldName, value) => store.updateColumn([index, fieldName], value)

  render () {
    if (!store.opened) return null
    return (
      <Modal show keyboard={false} bsSize="lg" dialogClassName={styles.modal}>
        <Header>
          <Title>DataSheet columns</Title>
        </Header>
        <Body>
          <div>
            <div className={styles.fileContainer}>
              <input type="file" onChange={this.onChangeFile} />
              <button className="btn btn-info" onClick={this.sendFile}>
                Import
              </button>
              <button className="btn btn-default mlx" onClick={this.addColumn}>
                Add Field
              </button>
            </div>
            <div className={styles.columnContainer}>
              {store.columns.map((column, index) => (
                <Column
                  key={index}
                  index={index}
                  column={column}
                  remove={column => store.remove(column)}
                  update={this.updateColumn}
                />
              ))}
            </div>
          </div>
        </Body>
        <Footer>
          <button className="btn btn-success" onClick={this.save}>
            Save
          </button>
          <button className="btn btn-danger" onClick={this.close}>
            Cancel
          </button>
        </Footer>
      </Modal>
    )
  }
}
