/* eslint-disable react/no-find-dom-node */
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { findDOMNode } from 'react-dom'
import { DropdownButton, MenuItem } from 'react-bootstrap'
import update from 'react-addons-update'
import styles from './SideBySide.scss'

const LIKERT_TYPES = ['Drop Down', 'Single Answer', 'Multiple Answer']
const INPUTS_TYPES = ['Short', 'Medium', 'Long', 'Essay']

export class Menu extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
    data: PropTypes.object.isRequired,
    index: PropTypes.number.isRequired,
    onChange: PropTypes.func.isRequired,
  }

  update = () => {
    const { model, onChange } = this.props
    model.update()
    onChange && onChange()
  }

  add = () => {
    const { data, model: { moduleConfig } } = this.props
    data.answers += 1
    data.answersTexts.push(moduleConfig.defaultAnswerText(data.answers))
    this.update()
  }

  removeAnswer = () => {
    const { data } = this.props
    if (data.answers === 0) { return }
    data.answers -= 1
    data.answersTexts.splice(data.answers)
    this.update()
  }

  remove = () => {
    const { index, model: { props } } = this.props
    props.columnsData.splice(index, 1)
    props.scalePoints -= 1
    this.update()
  }

  changeInputType = (data, type) => {
    data.textType = type
    this.update()
  }

  changeLikertType = (data, type) => {
    data.likertType = type
    this.update()
  }

  changeType = (type) => {
    const { data } = this.props
    data.type = type
    this.update()
  }

  toggle = (opened) => {
    const btn = findDOMNode(this.dropdown)
    const rect = btn.getBoundingClientRect()
    setTimeout(() => {
      const menu = findDOMNode(this.dropdown).children[1]
      if (opened) {
        menu.setAttribute('style', `
          position: fixed;
          z-index: 9999;
          top: ${rect.top + 30}px;
          left: ${rect.left}px;`)
      }
    }, 0)
  }

  moveRight = () => {
    const { model, index } = this.props
    const collection = model.props.columnsData
    const i = index
    if (i === collection.length - 1) { return }

    const item = collection[i]
    model.props.columnsData = update(collection, {
      $splice: [
        [i, 1],
        [i + 1, 0, item],
      ],
    })

    this.update()
  }

  moveLeft = () => {
    const { model, index } = this.props
    const i = index
    if (i === 0) { return }
    const collection = model.props.columnsData
    const item = collection[i]
    model.props.columnsData = update(collection, {
      $splice: [
        [i, 1],
        [i - 1, 0, item],
      ],
    })
    this.update()
  }

  renderLikertMenu () {
    const { data } = this.props
    return (
      LIKERT_TYPES.map((type, i) => {
        const trimed = type.replace(/\s+/g, '')
        return (
          <MenuItem key={i} onSelect={e => this.changeLikertType(data, trimed, e)}>
            <span className={`${trimed === data.likertType ? 'fa fa-check' : ''} ${styles.menuicon}`} />
            {type}
          </MenuItem>
        )
      })
    )
  }

  renderInputs () {
    const { data } = this.props
    return (
      INPUTS_TYPES.map((type, i) => (
        <MenuItem key={i} onSelect={e => this.changeInputType(data, type, e)}>
          <span className={`${type === data.textType ? 'fa fa-check' : ''} ${styles.menuicon}`} />
          {type}
        </MenuItem>
      ))
    )
  }

  render () {
    const { data, index } = this.props
    return (
      <DropdownButton
        ref={(ref) => { this.dropdown = ref }}
        bsStyle="default"
        title={(
          <span>
            <span className="fa fa-gear" />
            Column Options
          </span>
        )}
        id={`column_menu_${index}`}
      >
        <MenuItem onSelect={this.add}>
          <span className={`fa fa-plus-circle ${styles.menuicon}`} />
          Add Column Answer
        </MenuItem>
        <MenuItem onSelect={this.removeAnswer}>
          <span className={`fa fa-minus-circle ${styles.menuicon}`} />
          Remove Column Answer
        </MenuItem>
        <MenuItem divider style={{ padding: '2px 0 0' }} />
        <MenuItem onSelect={this.moveRight}>
          <span className={`fa fa-arrow-right ${styles.menuicon}`} />
          Move Right
        </MenuItem>
        <MenuItem onSelect={this.moveLeft}>
          <span className={`fa fa-arrow-left ${styles.menuicon}`} />
          Move Left
        </MenuItem>
        <MenuItem divider style={{ padding: '2px 0 0' }} />
        <MenuItem onSelect={e => this.changeType('Likert', e)}>
          <span className={`${data.type === 'Likert' ? 'fa fa-check' : ''} ${styles.menuicon}`} />
          Scaled Response (Likert)
        </MenuItem>
        <MenuItem onSelect={e => this.changeType('Text', e)}>
          <span className={`${data.type !== 'Likert' ? 'fa fa-check' : ''} ${styles.menuicon}`} />
          Open Ended Text
        </MenuItem>
        <MenuItem divider style={{ padding: '2px 0 0' }} />
        {data.type === 'Likert' ? this.renderLikertMenu() : this.renderInputs()}
        <MenuItem divider style={{ padding: '2px 0 0' }} />
        <MenuItem onSelect={this.remove}>
          <span className={`fa fa-remove ${styles.menuicon}`} />
          Remove Column
        </MenuItem>
      </DropdownButton>
    )
  }
}

export default Menu
