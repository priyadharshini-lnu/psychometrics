/* eslint-disable react/no-access-state-in-setstate */
/* eslint-disable react/no-find-dom-node */
import _ from 'lodash'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { findDOMNode } from 'react-dom'
import { DndProvider, DragSource, DropTarget } from 'react-dnd'
import HTML5Backend from 'react-dnd-html5-backend'

import update from 'react-addons-update'
import I18nStore from 'store/I18nStore'
import ItemPreview from './ItemPreview'
import styles from './DragAndDrop.scss'

const itemSource = {
  beginDrag (props) {
    return {
      id: props.id,
      index: props.index,
      text: props.text,
      number: props.number,
    }
  },

  endDrag (props) {
    props.endMoveItem()
  },
}

const itemTarget = {
  hover (props, monitor, component) {
    const dragIndex = monitor.getItem().index
    const hoverIndex = props.index
    if (dragIndex === hoverIndex) {
      return
    }
    const hoverBoundingRect = findDOMNode(component).getBoundingClientRect()
    const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2
    const clientOffset = monitor.getClientOffset()
    const hoverClientY = clientOffset.y - hoverBoundingRect.top

    if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
      return
    }

    if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
      return
    }

    props.moveItem(dragIndex, hoverIndex)
    monitor.getItem().index = hoverIndex
  },
}

let Item = class extends Component {
  static propTypes = {
    connectDragSource: PropTypes.func.isRequired,
    connectDropTarget: PropTypes.func.isRequired,
    isDragging: PropTypes.bool.isRequired,
    text: PropTypes.string.isRequired,
    number: PropTypes.number,
  }

  render () {
    const {
      text, isDragging, connectDragSource, connectDropTarget, number,
    } = this.props
    const opacity = isDragging ? 0 : 1
    return (
      connectDragSource(connectDropTarget(
        <div className={styles.item} style={{ opacity }}>
          <span className={`fa fa-bars ${styles.icon}`} />
          <div className={styles.number}>{number}</div>
          <div className={styles.text}>{text}</div>
        </div>,
      ))
    )
  }
}

Item = DropTarget('Item', itemTarget, connect => ({
  connectDropTarget: connect.dropTarget(),
}))(Item)

Item = DragSource('Item', itemSource, (connect, monitor) => ({
  connectDragSource: connect.dragSource(),
  connectDragPreview: connect.dragPreview(),
  isDragging: monitor.isDragging(),
}))(Item)

class Preview extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
  }

  constructor (props) {
    super(props)
    this.state = this.dataForState(props.model)
  }


  componentWillReceiveProps (nextProps) {
    this.setState(this.dataForState(nextProps.model))
  }

  dataForState = model => ({
    data: _.map(model.result.answers, answer => ({
      id: answer.index,
      text: I18nStore.tQuestion(model, `choicesTexts${answer.index + 1}`, { choice: answer.index })
              || model.moduleConfig.defaultChoiceText(answer.index + 1),
    })),
  })

  moveItem = (dragIndex, hoverIndex) => {
    const { readOnly } = this.props
    if (readOnly) { return }
    const { data } = this.state
    const dragItem = data[dragIndex]

    this.setState(update(this.state, {
      data: {
        $splice: [
          [dragIndex, 1],
          [hoverIndex, 0, dragItem],
        ],
      },
    }))
  }

  endMoveItem = () => {
    const { data } = this.state
    const { model } = this.props
    model.result.answer(data.map((item, i) => ({ index: item.id, value: i })))
  }

  render () {
    const { data } = this.state
    return (
      <DndProvider backend={HTML5Backend}>
        <div className={styles.preview}>
          {data.map((item, i) => (
            <Item
              key={item.id}
              id={item.id}
              index={i}
              number={i + 1}
              text={item.text}
              moveItem={this.moveItem}
              endMoveItem={this.endMoveItem}
            />
          ))}
          <ItemPreview key="__preview" id="0" number="0" text="Item" />
        </div>
      </DndProvider>
    )
  }
}

export default Preview
