import _ from 'lodash'
import { Component } from 'react'
import { Modal } from 'react-bootstrap'
import AppStore from '~/modules/reports/store/AppStore'
import FilterModel from '~/modules/reports/models/Filter'
import { setIn } from '~/utils/immutable'
import styles from './FilterModal.less'
import Filter from './Filter'

const {
  Header, Body, Footer, Title,
} = Modal

export class FilterModal extends Component {
  constructor (props) {
    super(props)
    this.state = {
      filters: props.filters,
    }
  }

  addFilter = () => {
    this.setState(({ filters }) => ({
      filters: [
        ...filters, new FilterModel({ conditions: [{ type: 'RelationShip' }] }),
      ],
    }))
  }

  save = () => {
    const { filters } = this.state
    const { close } = this.props
    // TODO: implement save && redux
    AppStore.report.syncFilters(filters, () => {
      AppStore.update()
      close()
    })
  }

  change = (model, attrs) => {
    const { filters } = this.state
    this.setState(state => setIn(state,
      ['filters', _.findIndex(filters, model)],
      new FilterModel({ ...model, ...attrs })))
  }

  remove = (model) => {
    this.setState(({ filters }) => ({
      filters: filters.filter(f => f !== model),
    }))
  }

  renderFilters () {
    const { filters } = this.state
    if (filters.length) {
      return _.map(filters, (filter, i) => (
        <Filter key={i} model={filter} onChange={this.change} onRemove={this.remove} />
      ))
    }
    return (
      <div>No Filters</div>
    )
  }

  render () {
    const { close } = this.props
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
          <button className="btn btn-danger" onClick={close}>Cancel</button>
        </Footer>
      </Modal>
    )
  }
}

export default FilterModal
