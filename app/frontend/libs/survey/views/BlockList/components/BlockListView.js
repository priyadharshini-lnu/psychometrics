import React, { Component } from 'react'
import Block from 'views/Block'
import UndoRedoDispatcher from 'dispatchers/UndoRedoDispatcher'
import FlipMove from 'react-flip-move'
import styles from './BlockListView.scss'

export class BlockListView extends Component {
  storeListener = null

  undoListener = null

  redoListener = null

  componentDidMount () {
    this.undoListener = UndoRedoDispatcher.addListener('undo', this.update)
    this.redoListener = UndoRedoDispatcher.addListener('redo', this.update)
  }

  componentWillUnmount () {
    this.undoListener.remove()
    this.redoListener.remove()
  }

  update = () => {
    this.forceUpdate()
  }

  render () {
    const { blocks } = this.props

    return (
      <div className={styles.main}>
        <FlipMove>
          {blocks.map((block, i) => <Block model={block} key={block.id} last={i === (blocks.length - 1)} />)}
        </FlipMove>
      </div>
    )
  }
}

export default BlockListView
