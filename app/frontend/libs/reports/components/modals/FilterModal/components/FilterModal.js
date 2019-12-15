import _ from 'lodash'
import React, { Component } from 'react'
import { Modal } from 'react-bootstrap'
import store from 'rb/store/modals/FilterStore'
import AppStore from 'rb/store/AppStore'
import styles from './FilterModal.scss'
import Filter from './Filter'

const {
  Header, Body, Footer, Title,
} = Modal

export class FilterModal extends Component {
  componentDidMount () {
    this.popupListener = store.addListener('change', () => this.forceUpdate())
  }

  componentWillUnmount () {
    this.popupListener.remove()
  }

  close () {
    store.close()
  }

  addFilter () {
    store.addFilter()
  }

  save () {
    store.save()
  }

  renderFilters () {
    if (AppStore.report.filters.length) {
      return _.map(AppStore.report.filters, (filter, i) => (
        <Filter key={i} model={filter} />
      ))
    }
    return (
      <div>No Filters</div>
    )
  }

  render () {
    if (!store.opened) { return null }
    return (
      <Modal show keyboard={false} bsSize="lg" dialogClassName={styles.modal}>
        <Header>
          <Title>Filters</Title>
        </Header>
        <Body>
          {this.renderFilters()}
        </Body>
        <Footer>
          <button className="btn btn-default" style={{ float: 'left' }} onClick={this.addFilter}>Add Filter</button>
          <button className="btn btn-success" onClick={this.save}>Save</button>
          <button className="btn btn-danger" onClick={this.close}>Cancel</button>
        </Footer>
      </Modal>
    )
  }
}

export default FilterModal
