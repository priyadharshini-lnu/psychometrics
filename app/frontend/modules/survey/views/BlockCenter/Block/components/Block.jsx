import { Component } from 'react'
import PropTypes from 'prop-types'
import { DropdownButton, MenuItem } from 'react-bootstrap'
import FlipMove from 'react-flip-move'
import Question from '~/modules/survey/views/BlockCenter/Question'
import InlineEditor from '~/modules/survey/components/InlineEditor'
import Footer from './BlockFooter'
import styles from './Block.less'

class Block extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
    last: PropTypes.bool,
  }

  state = {
    opened: true,
  }

  expand = () => {
    const { opened } = this.state
    this.setState({ opened: !opened })
  }

  changeName = (value) => {
    const { renameBlock, model } = this.props
    renameBlock(model, value)
  }

  questionRandomization = () => {
    const { model, openRandomization } = this.props
    openRandomization({ model, entityName: 'question' })
  }

  renderOptions () {
    const { model } = this.props
    return (
      <DropdownButton
        onClick={e => e.stopPropagation(e)}
        className={styles.dropdown}
        bsStyle="default"
        title={(
          <span>
            <span className="icon fa fa-gear" />
            Block Options
          </span>
        )}
        id={`block_menu_${model.id}`}
      >
        <MenuItem onSelect={this.questionRandomization}>
          <span className={`icon fa fa-random ${styles.menuicon}`} />
          Question Randomization...
        </MenuItem>
      </DropdownButton>
    )
  }

  renderRandomLabel () {
    const { model } = this.props
    if (model.props.randomization && model.props.randomization.type !== 'No') {
      return (
        <div className={styles.randomized}>
          <span className="fa fa-random" />
          Randomized
        </div>
      )
    }
  }

  render () {
    const {
      model, last, createBlock, questions,
    } = this.props
    if (!model) { return null }
    const { opened } = this.state

    const iconClass = `fa fa-chevron-down ${styles.icon} ${opened ? '' : 'fa-rotate-270'}`
    return (
      <div className={styles.block}>
        <div className={styles.header}>
          <div className={styles.expander}>
            <span onClick={this.expand} className={iconClass} />
            <InlineEditor value={model.name} onChange={this.changeName} />
          </div>
          <div>
            {this.renderRandomLabel()}
            <div className={styles.options}>{this.renderOptions()}</div>
          </div>
        </div>
        <div className={[styles.content]} style={{ display: opened ? 'block' : 'none' }}>
          <FlipMove style={{ position: 'initial' }}>
            {questions.map((question) => {
              if (question.type !== 'PageBreak') {
                return (
                  <div key={question.id}>
                    <Question block={model} model={question} />
                  </div>
                )
              }
            })}
          </FlipMove>
          <Footer createBlock={createBlock} model={model} onMinimize={this.expand} last={last} {...this.props} />
        </div>
      </div>
    )
  }
}

export default Block
