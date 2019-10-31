import React, { Component } from 'react'
import PropTypes from 'prop-types'
import BlockListDispatcher from 'dispatchers/BlockListDispatcher'
import Menu from 'components/ModulesMenu'
import CreateByTemplateStore from 'store/CreateByTemplateStore'
import styles from './Block.scss'

class BlockFooter extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
  }

  state = {
    opened: true,
  }

  expand = () => {
    const { opened } = this.state
    this.setState({ opened: !opened })
  }

  addBlock = () => {
    BlockListDispatcher.create()
  }

  createDefault = () => {
    const { model } = this.props
    model.addQuestion()
  }

  changeType = (type) => {
    const { model } = this.props
    model.addQuestion({ type })
  }

  openSearch = () => {
    const { model } = this.props
    CreateByTemplateStore.open(model, 'Question')
  }

  render () {
    return (
      <div className={styles.footer}>
        <div className={styles.footerButtons}>
          <div style={{ position: 'relative' }}>
            <button onClick={this.createDefault} type="button" className={`btn btn-success ${styles.button}`}>
              <span className={`icon fa fa-plus ${styles.icon}`} />
              {' '}
              Create a New Question...
            </button>
            <button type="button" className="btn btn-success dropdown-toggle" data-toggle="dropdown">
              <span className="caret" />
            </button>
            <Menu onSelect={this.changeType} className={styles.menu} />
          </div>
        </div>
      </div>
    )
  }
}

export default BlockFooter
