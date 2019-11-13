import _ from 'lodash'
import React, { Component } from 'react'
import store from 'store/MappingNormsStore'
import RuleElement from 'components/RuleElement'
import { Modal } from 'react-bootstrap'
import styles from './MappingNorms.scss'

const {
  Header, Body, Footer, Title,
} = Modal

export class MappingNorms extends Component {
  componentDidMount () {
    this.storeListener = store.addListener('change', () => this.forceUpdate())
  }

  componentWillUnmount () {
    this.storeListener.remove()
  }

  save = () => {
    store.save()
  }

  cancel = () => {
    store.close()
    this.forceUpdate()
  }

  addRule = () => {
    store.addRule()
    this.forceUpdate()
  }

  renderRules () {
    return _.map(store.assessment.norm_rules, (rule, index) => (
      <RuleElement key={index} model={rule} />
    ))
  }

  render () {
    if (!store.show) { return null }
    return (
      <Modal show bsSize="lg" keyboard={false} dialogClassName={styles.modal}>
        <Header>
          <Title>
            {store.assessment.name}
: Mapping Norms
          </Title>
        </Header>
        <Body bsClass={styles.body}>
          {this.renderRules()}
          <div className={`${styles.addRuleButton} btn btn-default`} onClick={this.addRule}>
            <span className="fa fa-plus" />
            Add Rule
          </div>
        </Body>
        <Footer>
          <button className="btn btn-success" onClick={this.save}>Save</button>
          <button className="btn btn-danger" onClick={this.cancel}>Cancel</button>
        </Footer>
      </Modal>
    )
  }
}

export default MappingNorms
