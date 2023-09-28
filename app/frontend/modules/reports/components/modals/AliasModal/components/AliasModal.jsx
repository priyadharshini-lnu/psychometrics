import _ from 'lodash'
import { Component } from 'react'
import { Modal } from 'react-bootstrap'
import { setIn } from '~/utils/immutable'
import styles from './AliasModal.less'
import Alias from './Alias'

const {
  Header, Body, Footer, Title,
} = Modal

export class AliasModal extends Component {
  constructor (props) {
    super(props)
    this.state = {
      factors: props.factors.reduce((l, f) => ({ ...l, [f.id]: f }), {}),
    }
  }

  save = () => {
    const { factors } = this.state
    const { showSavePopup } = this.props
    showSavePopup({ factors })
  }

  changeFactor = (factor, alias) => {
    this.setState(state => setIn(state, ['factors', factor.id, 'alias'], alias))
  }

  renderData = () => {
    const { factors } = this.state
    if (_.size(factors)) {
      return (
        <table className={styles.mainTable}>
          <thead>
            <tr>
              <th>Factor</th>
              <th>Factor Alias</th>
            </tr>
          </thead>
          <tbody>
            {this.renderAliases(factors)}
          </tbody>
        </table>
      )
    }
    return (
      <div>No Aliases</div>
    )
  }

  renderAliases = factors => _.map(factors, (factor, i) => (
    <Alias key={i} model={factor} onChange={this.changeFactor} />
  ))

  render () {
    const { close } = this.props
    return (
      <Modal show keyboard={false} bsSize="lg" dialogClassName={styles.modal} className={styles.firstModal}>
        <Header>
          <Title>Aliases</Title>
        </Header>
        <Body>
          {this.renderData()}
        </Body>
        <Footer>
          <button className="btn btn-success" onClick={this.save}>Save</button>
          <button className="btn btn-danger" onClick={close}>Cancel</button>
        </Footer>
      </Modal>
    )
  }
}

export default AliasModal
