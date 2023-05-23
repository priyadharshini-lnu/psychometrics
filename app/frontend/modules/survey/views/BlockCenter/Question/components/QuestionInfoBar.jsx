import _ from 'lodash'
import { Component } from 'react'
import PropTypes from 'prop-types'
import { DropdownButton, MenuItem } from 'react-bootstrap'
import InlineEditor from '~/modules/survey/components/InlineEditor'
import styles from './Question.less'

class Question extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
  }

  addNote = () => {
    const { model, addNote } = this.props
    addNote(model)
  }

  invokeAdvanced = (element) => {
    const { model } = this.props
    _.invoke(model, element.callback)
  }

  randomization = () => {
    const { model, openRandomization } = this.props
    openRandomization({ model, entityName: 'choice' })
  }

  changeName = (value) => {
    const { renameQuestion, model } = this.props
    renameQuestion(model, value)
  }

  renderRandomMenuItem () {
    const { moduleConfig } = this.props
    if (moduleConfig.randomization) {
      return (
        <MenuItem onSelect={this.randomization}>
          <span className={`icon fa fa-random ${styles.menuicon}`} />
          Randomization...
        </MenuItem>
      )
    }
    return null
  }

  renderOptions () {
    const { model } = this.props
    return (
      <DropdownButton
        onClick={e => e.stopPropagation(e)}
        className={styles.dropdown}
        bsStyle="default"
        title={<span className="icon fa fa-gear" />}
        id={`block_menu_${model.id}`}
      >
        <MenuItem onSelect={this.addNote}>
          <span className={`icon fa fa-pencil-square-o ${styles.menuicon}`} />
          Add Note...
        </MenuItem>
        {this.renderRandomMenuItem()}
      </DropdownButton>
    )
  }

  renderRandomLabel () {
    const { model, moduleConfig } = this.props
    if (moduleConfig.randomization) {
      return model.props.randomization.type !== 'No' && (
        <div title="This question has randomization" className={styles.randomized}>
          <span className="fa fa-random" />
        </div>
      )
    }
    return null
  }


  render () {
    const { model } = this.props
    return (
      <div className={styles.infobar}>
        <InlineEditor styles={styles.editable} onChange={this.changeName} value={model.name} />
        {this.renderOptions()}
        {this.renderRandomLabel()}
      </div>
    )
  }
}

export default Question
