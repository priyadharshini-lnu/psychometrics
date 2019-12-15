import React, { Component } from 'react'
import UndoRedoDispatcher from 'rb/dispatchers/UndoRedoDispatcher'
import store from 'rb/store/UndoRedoStore'
import styles from './ActionsHistory.scss'

class ActionsHistory extends Component {
  componentDidMount () {
    document.addEventListener('keydown', (e) => {
      const key = e.which
      if (e.ctrlKey || e.metaKey) {
        if (key === 90) {
          e.shiftKey ? this.redo() : this.undo()
        }
      }
    })

    store.onChange = () => this.forceUpdate()
  }

  undo = () => {
    UndoRedoDispatcher.undo()
    this.forceUpdate()
  }

  redo = () => {
    UndoRedoDispatcher.redo()
    this.forceUpdate()
  }

  render () {
    const undoDisabled = !store.get().canUndo()
    const redoDisabled = !store.get().canRedo()
    return (
      <div onKeyDown={this.keydown} className={styles.actions}>
        <button disabled={undoDisabled} className={`btn btn-default ${styles.btn}`} onClick={this.undo}>
          <span className="fa fa-undo" />
          Undo
        </button>
        <button disabled={redoDisabled} className={`btn btn-default ${styles.btn}`} onClick={this.redo}>
          <span className="fa fa-repeat" />
          Redo
        </button>
      </div>
    )
  }
}

export default ActionsHistory
