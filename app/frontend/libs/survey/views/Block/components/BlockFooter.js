import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Menu from 'components/ModulesMenu'
import Block from 'models/Block'
import styles from './Block.scss'

class BlockFooter extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
    onMinimize: PropTypes.func,
  }

  state = {
    opened: true,
  }

  expand = () => {
    const { opened } = this.state
    this.setState({ opened: !opened })
  }

  addBlock = () => {
    const { model, createBlock } = this.props
    createBlock(new Block({ position: model.position }))
  }

  createDefault = () => {
    const { addQuestion, model } = this.props
    addQuestion(model)
  }

  changeType = (type) => {
    const { addQuestion, model } = this.props
    addQuestion(model, { type })
  }

  openSearchQuestionPopup = () => {
    const { openCreateByTemplate, model } = this.props
    openCreateByTemplate({ blockId: model.id, entityName: 'Question' })
  }

  openSearchBlockPopup = () => {
    const { openCreateByTemplate, model } = this.props
    openCreateByTemplate({ position: model.position, entityName: 'Block' })
  }

  renderCopyQuestion () {
    const { model } = this.props
    if (!model.templateId) {
      return (
        <a onClick={this.openSearchQuestionPopup} className={`btn btn-default ${styles.button}`}>
          <span className={`icon fa fa-copy ${styles.icon}`} />
          Copy Question From...
        </a>
      )
    }
    return (
      <a className={`btn btn-default ${styles.button}`} style={{ opacity: 0 }} />
    )
  }

  render () {
    const { onMinimize } = this.props
    return (
      <div className={styles.footer}>
        <div className={styles.footerButtons}>
          {this.renderCopyQuestion()}
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
        <div className={styles.footerOptions}>
          <div className={styles.footerMinimize} onClick={onMinimize}>Minimize Block</div>
          <div onClick={this.addBlock} className={`${styles.footerMinimize} ${styles.footerAddBlock}`}>
            Add Block
          </div>
          <div onClick={this.openSearchBlockPopup} className={`${styles.footerMinimize} ${styles.footerAddBlock}`}>
            Copy Block From...
          </div>
        </div>
      </div>
    )
  }
}

export default BlockFooter
