import { Component } from 'react'
import PropTypes from 'prop-types'
import { Popover, Button } from 'antd'
import Menu from '~/modules/survey/components/ModulesMenu'
// import CreateByTemplateStore from 'store/CreateByTemplateStore'
import styles from './Block.less'

class BlockFooter extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
  }

  state = {
    opened: true,
    isMenuOpen: false,
  }

  expand = () => {
    const { opened } = this.state
    this.setState({ opened: !opened })
  }

  createDefault = () => {
    const { addQuestion, model } = this.props
    addQuestion(model)
  }

  changeType = (type) => {
    const { addQuestion, model } = this.props
    this.setState({ isMenuOpen: false })
    addQuestion(model, { type })
  }

  openSearch = () => {
    const { openCreateByTemplate, model } = this.props
    openCreateByTemplate({ blockId: model.id, entityName: 'Question' })
  }

  render () {
    const { isMenuOpen } = this.state
    return (
      <div className={styles.footer}>
        <div className={styles.footerButtons}>
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
      </div>
    )
  }
}

export default BlockFooter
