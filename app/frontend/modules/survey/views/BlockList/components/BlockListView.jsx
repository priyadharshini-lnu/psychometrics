import { Component } from 'react'
import Block from '~/modules/survey/views/Block'
import UndoRedoDispatcher from '~/modules/survey/dispatchers/UndoRedoDispatcher'
import styles from './BlockListView.less'

export class BlockListView extends Component {
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
        {blocks.map((block, i) => (
          <Block
            model={block}
            key={block.id}
            last={i === (blocks.length - 1)}
            first={i === 0}
          />
        ))}
      </div>
    )
  }
}

export default BlockListView
