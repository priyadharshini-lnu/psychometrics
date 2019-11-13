import _ from 'lodash'
import React from 'react'
import { Modal } from 'react-bootstrap'
import store from '../../../store/LibraryStore'
import styles from './Library.scss'

const { Header } = Modal
const { Body } = Modal
const { Footer } = Modal
const { Title } = Modal

export class Library extends React.Component {
  origin = location.origin

  // Filter items
  filter = _.debounce(() => {
    const { folderId, searchQuery } = this.state
    this.loadFolder(folderId, searchQuery)
  }, 500)

  constructor () {
    super()
    this.state = {
      folderId: 0,
      searchQuery: '',
      loading: true,
    }
  }

  componentDidMount () {
    this.storeListener = store.addListener('change', () => this.updateList())
  }

  componentWillUnmount () {
    this.storeListener.remove()
  }

  updateList = () => {
    this.setState({ loading: false })
    this.forceUpdate()
  }

  loadFolder = (folderId) => {
    const { searchQuery } = this.state
    this.setState({ folderId, loading: true })
    store.loadFolder(folderId, searchQuery)
  }

  select = (item) => {
    store.select(item)
  }

  cancel = () => {
    store.close()
    this.forceUpdate()
  }

  // Type in search input
  handleChange = (event) => {
    const { value } = event.target
    this.setState({ searchQuery: value })
    this.filter()
  }


  renderBreadcrumb () {
    return (
      <ul className="breadcrumb library">
        <li>You here:</li>
        <li><a className={styles.link} onClick={this.loadFolder.bind(this, 0, '')}>Media Library</a></li>
        {
          _.map(store.data.breadcrumbs, (item, index) => (
            <li key={index}><a className={styles.link} onClick={() => this.loadFolder(item.id, '')}>{item.name}</a></li>
          ))
        }
      </ul>
    )
  }

  renderType (item) {
    if (item.type === 'image') {
      return (
        <img alt={item.name} src={item.thumb} />
      )
    }
    return (<i className={`icon ${item.icon}`} style={{ fontSize: '30px' }} />)
  }

  renderName (item) {
    if (item.type === 'folder') {
      return (
        <a className={styles.link} onClick={() => this.loadFolder(item.id, '')}>
          {item.name}
        </a>
      )
    }
    return item.name
  }

  renderSelect (item) {
    if (item.type !== 'folder') {
      return (
        <a className="btn btn-default" onClick={() => this.select(item)}>
          Select
        </a>
      )
    }
  }

  renderItem = (item, index) => (
    <tr key={index}>
      <td className={styles.image}>
        {this.renderType(item)}
      </td>
      <td>
        {this.renderName(item)}
      </td>
      <td>{item.description}</td>
      <td>{item.created_at}</td>
      <td>{this.renderSelect(item)}</td>
    </tr>
  )

  renderLoading () {
    const { loading } = this.state
    if (loading === true) {
      return (
        <div ref={(ref) => { this.loading = ref }} className={`${styles.loading} panel-refresh-layer`}>
          <img src={`${this.origin}/loaders/default.gif`} />
        </div>
      )
    }
  }

  render () {
    if (!store.show) { return null }
    return (
      <Modal show bsSize="lg" keyboard={false} dialogClassName={styles.modal}>
        <Header>
          <Title>Media Library</Title>
        </Header>
        <Body bsClass={styles.body}>
          <div className="row">
            <div className="col-md-8">
              {this.renderBreadcrumb()}
            </div>
            <div className="col-md-4">
              <input placeholder="Search" onChange={this.handleChange} className="form-control" type="text" />
            </div>
          </div>
          <table className="table table-bordered table-actions table-hover selectable list">
            <thead>
              <tr>
                <th className={styles.textCenter} width="100">Type</th>
                <th>Name</th>
                <th>Description</th>
                <th>Created at</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {_.map(store.data.items, (item, index) => this.renderItem(item, index))}
            </tbody>
          </table>
          {this.renderLoading()}
        </Body>
        <Footer>
          <button className="btn btn-danger" onClick={this.cancel}>Cancel</button>
        </Footer>
      </Modal>
    )
  }
}

export default Library
