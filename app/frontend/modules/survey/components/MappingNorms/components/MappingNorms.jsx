import _ from 'lodash'
import { Component } from 'react'
import { Modal } from 'react-bootstrap'
import Rule from '~/modules/survey/models/Rule'
import RuleElement from '~/modules/survey/components/RuleElement'
import styles from './MappingNorms.less'

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
    addNormRule(new Rule())
  }

  renderRules () {
    const { norms } = this.props

    return _.map(norms, (rule, index) => (
      <RuleElement key={index} model={rule} index={index} />
    ))
  }

  render () {
    const {
      assessment, close, normData, changeDefaultNorm, defaultNormId,
    } = this.props
    return (
      <Modal show bsSize="lg" keyboard={false} dialogClassName={styles.modal}>
        <Header>
          <Title>
            {assessment.name}
            : Mapping Norms
          </Title>
        </Header>
        <Body bsClass={styles.body}>
          <div>
            <div className={styles.row}>
              <span>Default Norm</span>
              <select
                className={styles.select}
                value={defaultNormId || undefined}
                onChange={e => changeDefaultNorm(e.currentTarget.value)}
              >
                <option value={null} />
                {_.map(normData, norm => (<option key={norm.id} value={norm.id || ''}>{norm.name}</option>))}
              </select>
            </div>
          </div>
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
