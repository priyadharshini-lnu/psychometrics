import { Component } from 'react'
import PropTypes from 'prop-types'
import { Popover, Button } from 'antd'
import Block from '~/modules/survey/models/Block'
import Menu from '~/modules/survey/components/ModulesMenu'
import styles from './Block.less'

class BlockFooter extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
    onMinimize: PropTypes.func,
  }

  state = {
    opened: true,
    isMenuOpen: false,
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
    this.setState({ isMenuOpen: false })
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
        <Button
          onClick={this.openSearchQuestionPopup}
          icon={<span className={`icon fa fa-copy ${styles.icon}`} />}
          className={`${styles.button}`}
        >
          Copy Question From...
        </Button>
      )
    }
    return (
      <a className={`btn btn-default ${styles.button}`} style={{ opacity: 0 }} />
    )
  }

  render () {
    const { onMinimize } = this.props
    const { isMenuOpen } = this.state
    return (
      <div className={styles.footer}>
        <div className={styles.footerButtons}>
          {this.renderCopyQuestion()}
          <div className={styles.createQuestion}>
            <Button
              type="primary"
              menu={[]}
              icon={<span className={`icon fa fa-plus ${styles.icon}`} />}
              onClick={this.createDefault}
              className={styles.left}
            >
              Create a New Question...
            </Button>
            <Popover
              trigger="click"
              overlayInnerStyle={{ padding: 0 }}
              onClick={() => this.setState({ isMenuOpen: true })}
              content={<Menu onSelect={this.changeType} />}
              open={isMenuOpen}
              onOpenChange={open => this.setState({ isMenuOpen: open })}
            >
              <Button className={styles.right} type="primary" icon={<span className="caret" />} />
            </Popover>
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
