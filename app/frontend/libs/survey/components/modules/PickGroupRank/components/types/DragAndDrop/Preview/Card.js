/* eslint-disable react/no-find-dom-node */
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { findDOMNode } from 'react-dom'
import { DragSource, DropTarget } from 'react-dnd'
import flow from 'lodash/flow'
import I18nStore from 'store/I18nStore'
import styles from '../DragAndDrop.scss'

class Card extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
    connectDragSource: PropTypes.func.isRequired,
    connectDropTarget: PropTypes.func.isRequired,
    isDragging: PropTypes.bool.isRequired,
    cardId: PropTypes.number.isRequired,
  }

  render () {
    const {
      model, cardId, isDragging, connectDragSource, connectDropTarget,
    } = this.props
    const opacity = isDragging ? 0 : 1

    return connectDragSource(connectDropTarget(
      <div className={styles.item} style={{ opacity }}>
        {I18nStore.tQuestion(model, `choicesTexts${cardId + 1}`, { choice: cardId })
          || model.moduleConfig.defaultChoiceText(cardId + 1)}
      </div>,
    ))
  }
}

const cardSource = {

  beginDrag (props) {
    return {
      cardId: props.cardId,
      listId: props.listId,
      index: props.index,
      questionId: props.questionId,
    }
  },

  endDrag (props, monitor) {
    const card = monitor.getItem()
    const dropResult = monitor.getDropResult()

    if (dropResult && dropResult.listId !== card.listId) {
      props.removeCard(card.index)
    }

    props.onEndDrug()
  },
}

const cardTarget = {

  hover (props, monitor, component) {
    const dragIndex = monitor.getItem().index
    const hoverIndex = props.index
    const sourceListId = monitor.getItem().listId

    // Don't replace items with themselves
    if (dragIndex === hoverIndex) {
      return
    }

    // Determine rectangle on screen
    const hoverBoundingRect = findDOMNode(component).getBoundingClientRect()

    // Get vertical middle
    const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2

    // Determine mouse position
    const clientOffset = monitor.getClientOffset()

    // Get pixels to the top
    const hoverClientY = clientOffset.y - hoverBoundingRect.top

    // Dragging downwards
    if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
      return
    }

    // Dragging upwards
    if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
      return
    }

    // Time to actually perform the action
    if (props.listId === sourceListId) {
      props.moveCard(dragIndex, hoverIndex)
      monitor.getItem().index = hoverIndex
    }
  },
}

export default flow(
  DropTarget('CARD', cardTarget, connect => ({
    connectDropTarget: connect.dropTarget(),
  })),
  DragSource('CARD', cardSource, (connect, monitor) => ({
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging(),
  })),
)(Card)
