/* eslint-disable import/no-mutable-exports */
import React, { Component } from 'react'
import store from 'rb/store/PageList'
import ScrollDispatcher from 'rb/dispatchers/ScrollDispatcher'
import { DragSource, DropTarget } from 'react-dnd'
import styles from './PageEditor.scss'

const pageSource = {
  beginDrag (props) {
    return {
      id: props.page.id,
      originalIndex: props.findPage(props.page.id).index,
    }
  },

  endDrag (props, monitor) {
    const { id: droppedId, originalIndex } = monitor.getItem()
    const didDrop = monitor.didDrop()
    props.onChange()

    if (!didDrop) {
      props.movePage(droppedId, originalIndex)
    }
  },
}

const pageTarget = {
  canDrop () {
    return false
  },

  hover (props, monitor) {
    const { id: draggedId } = monitor.getItem()
    const overId = props.page.id

    if (draggedId !== overId) {
      const { index: overIndex } = props.findPage(overId)
      props.movePage(draggedId, overIndex)
    }
  },
}

let PageLabel = class extends Component {
  update = () => {
    this.forceUpdate()
  }

  scrollTo = () => {
    const { page } = this.props
    if (page.visible) {
      ScrollDispatcher.scroll(page.id)
    }
  }

  changeVisible = (model, e) => {
    model.visible = e.currentTarget.checked
    store.update()
  }

  render () {
    const {
      page, isDragging, connectDragSource, connectDropTarget, active, number,
    } = this.props
    const opacity = isDragging ? 0 : 1

    return connectDragSource(connectDropTarget(
      <div className={`${styles.page} ${active ? styles.active : ''}`} onClick={this.scrollTo} style={{ opacity }}>
        <i className="fa fa-bars" />
        <input
          type="checkbox"
          checked={page.visible}
          onChange={e => this.changeVisible(page, e)}
          className={styles.visibility}
        />
        <div className={styles.pageName}>{page.name}</div>
        <div className={styles.pageNumber}>{number}</div>
      </div>,
    ))
  }
}

PageLabel = DropTarget('Page', pageTarget, connect => ({
  connectDropTarget: connect.dropTarget(),
}))(PageLabel)

PageLabel = DragSource('Page', pageSource, (connect, monitor) => ({
  connectDragSource: connect.dragSource(),
  isDragging: monitor.isDragging(),
}))(PageLabel)

export default PageLabel
