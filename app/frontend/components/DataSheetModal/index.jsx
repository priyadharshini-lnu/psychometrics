import { Component } from 'react'
import _ from 'lodash'
import { Modal } from 'react-bootstrap'
import { setIn } from '~/utils/immutable'
import { DATA_SHEET_COLUMN_TYPES } from './constants'
import styles from './styles.less'
import Column from './Column'

const {
  Header, Body, Footer, Title,
} = Modal

export default class DataSheetModal extends Component {
  state = {
    file: null,
    columns: [],
  }

  componentDidMount () {
    const { columns } = this.props
    this.setState({ columns })
  }

  onChangeFile = ({ target }) => {
    this.setState({ file: target.files[0] })
  }

  sendFile = () => {
    const { file } = this.state
    const { uploadDataSheet, id } = this.props
    if (!file) return null
    const data = new FormData()
    data.append('file', file, file.name)
    uploadDataSheet(id, data).then(({ response }) => {
      this.updateColumns(response)
    })
  }

  save = () => {
    const { close, saveDataSheet } = this.props
    const { columns } = this.state
    saveDataSheet(_.cloneDeep(columns))
    close()
  }

  addColumn = () => {
    this.setState(({ columns }) => ({ columns: [...columns, { type: DATA_SHEET_COLUMN_TYPES[0] }] }))
  }

  removeColumn = (column) => {
    this.setState(({ columns }) => ({ columns: columns.filter(col => col.name !== column.name) }))
  }

  updateColumns = (columns) => {
    this.setState({ columns })
  }

  updateColumn = (index, fieldName, value) => {
    this.setState(({ columns }) => ({ columns: setIn(columns, [index, fieldName], value) }))
  }

  render () {
    const { close } = this.props
    const { columns } = this.state
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
              {columns.map((column, index) => (
                <Column
                  key={index}
                  index={index}
                  column={column}
                  remove={column => this.removeColumn(column)}
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
          <button className="btn btn-danger" onClick={close}>
            Cancel
          </button>
        </Footer>
      </Modal>
    )
  }
}
