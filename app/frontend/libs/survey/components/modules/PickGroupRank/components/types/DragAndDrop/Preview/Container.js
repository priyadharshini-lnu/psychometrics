/* eslint-disable react/no-will-update-set-state */
/* eslint-disable react/no-access-state-in-setstate */
import _ from 'lodash'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { DropTarget } from 'react-dnd'
import update from 'react-addons-update'
import Card from './Card'
import styles from '../DragAndDrop.scss'

class Container extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
    connectDropTarget: PropTypes.func.isRequired,
    id: PropTypes.number.isRequired,
    cards: PropTypes.array.isRequired,
    stacked: PropTypes.bool.isRequired,
    text: PropTypes.string,
    questionId: PropTypes.number.isRequired,
  }

  constructor (props) {
    super(props)
    this.state = {
      cards: _.map(props.cards, 'choice'),
    }
  }

  // Force Update State
  // REASON: if PickGroupRank there are on the next step
  // Then State not updated
  // TASK: PSYC-539
  componentWillUpdate (nextProps) {
    const { questionId } = this.props
    if (nextProps.questionId !== questionId) {
      this.setState({
        cards: _.map(nextProps.cards, 'choice'),
      })
    }
  }

  pushCard = (cardId) => {
    const { readOnly } = this.props
    if (readOnly) { return }
    this.setState(update(this.state, {
      cards: {
        $push: [cardId],
      },
    }))
  }

  removeCard = (index) => {
    const { readOnly } = this.props
    if (readOnly) { return }
    this.setState(update(this.state, {
      cards: {
        $splice: [
          [index, 1],
        ],
      },
    }))
  }

  moveCard = (dragIndex, hoverIndex) => {
    const { readOnly } = this.props
    if (readOnly) { return }
    const { cards } = this.state
    const dragCard = cards[dragIndex]

    this.setState(update(this.state, {
      cards: {
        $splice: [
          [dragIndex, 1],
          [hoverIndex, 0, dragCard],
        ],
      },
    }))
  }

  updateResults = () => {
    const { readOnly, model, id } = this.props
    const { cards } = this.state
    if (readOnly) { return }
    _.forEach(cards, (cardId, position) => {
      model.result.answer(id, cardId, position)
    })
    this.forceUpdate()
  }

  render () {
    const { cards } = this.state
    const { model, stacked, text } = this.props
    const { connectDropTarget, id, questionId } = this.props
    const stackItems = stacked ? styles.stackItems : ''

    return connectDropTarget(
      <div className={styles.group}>
        <div className={styles.text}>{text}</div>
        <div className={`${styles.items} ${stackItems}`}>
          {cards.map((cardId, i) => (
            <Card
              key={cardId}
              index={i}
              listId={id}
              cardId={cardId}
              questionId={questionId}
              model={model}
              removeCard={this.removeCard}
              moveCard={this.moveCard}
              onEndDrug={this.updateResults}
            />
          ))}
        </div>
      </div>,
    )
  }
}

const cardTarget = {
  drop (props, monitor, component) {
    if (props.readOnly) { return }
    const { id } = props
    const sourceObj = monitor.getItem()

    if (sourceObj.questionId !== props.questionId) {
      return false
    }

    if (id !== sourceObj.listId) {
      component.pushCard(sourceObj.cardId)
      component.updateResults()
    }

    return {
      listId: id,
    }
  },
}

export default DropTarget('CARD', cardTarget, (connect, monitor) => ({
  connectDropTarget: connect.dropTarget(),
  isOver: monitor.isOver(),
  canDrop: monitor.canDrop(),
}))(Container)
