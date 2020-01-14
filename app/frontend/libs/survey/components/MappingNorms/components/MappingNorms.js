import _ from 'lodash'
import React, { Component } from 'react'
import RuleElement from 'components/RuleElement'
import { Modal } from 'react-bootstrap'
import Rule from 'models/Rule'
import styles from './MappingNorms.scss'

const {
  Header, Body, Footer, Title,
} = Modal

export class MappingNorms extends Component {
  save = () => {
    const { close } = this.props
    close()
  }

  addRule = () => {
    const { addNormRule } = this.props
    addNormRule(new Rule({ conditions: [{ conditionType: 'Hris' }] }))
  }

  renderRules () {
    const { norms } = this.props

    return _.map(norms, (rule, index) => (
      <RuleElement key={index} model={rule} />
    ))
  }

  render () {
    const { assessment, close } = this.props
    return (
      <Modal show bsSize="lg" keyboard={false} dialogClassName={styles.modal}>
        <Header>
          <Title>
            {assessment.name}
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
          <button className="btn btn-danger" onClick={close}>Cancel</button>
        </Footer>
      </Modal>
    )
  }
}

export default MappingNorms
