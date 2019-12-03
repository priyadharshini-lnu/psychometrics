import React, { Component } from 'react'
import store from 'store/BlockList'
import Block from 'views/Block'
import UndoRedoDispatcher from 'dispatchers/UndoRedoDispatcher'
import styles from './BlockListView.scss'

export class BlockListView extends Component {
  storeListener = null

  undoListener = null

  redoListener = null

  componentDidMount () {
    this.storeListener = store.addListener('change', this.update)
    this.undoListener = UndoRedoDispatcher.addListener('undo', this.update)
    this.redoListener = UndoRedoDispatcher.addListener('redo', this.update)
  }

  componentWillUnmount () {
    this.storeListener.remove()
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
        {blocks.map((block, i) => <Block model={block} key={i} last={i === (blocks.length - 1)} />)}
      </div>
    )
  }
}

export default BlockListView
