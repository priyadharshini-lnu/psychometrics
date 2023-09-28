/* eslint-disable import/no-mutable-exports */
import { Component } from 'react'
import { DragSource, DropTarget } from 'react-dnd'
import { RightOutlined } from '@ant-design/icons'
import store from '~/modules/reports/store/PageList'
import ScrollDispatcher from '~/modules/reports/dispatchers/ScrollDispatcher'
import styles from './PageEditor.less'

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
    const { page, onClick } = this.props
    onClick(page.id)
    if (page.visible) {
      ScrollDispatcher.scroll(page.id)
    }
  }

  changeVisible = (model, e) => {
    model.visible = e.currentTarget.checked
    store.update()
  }

  openModules = (e) => {
    e.stopPropagation()
    const { onOpenModules, page } = this.props
    onOpenModules(page)
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
        <div className={styles.showModules} onClick={this.openModules}>
          <RightOutlined />
        </div>
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
