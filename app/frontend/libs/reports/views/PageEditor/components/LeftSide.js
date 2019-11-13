import React, { Component } from 'react'
import store from 'rb/store/PageList'
import { DropTarget } from 'react-dnd'
import update from 'react-addons-update'
import PageLabel from './PageLabel'
import styles from './PageEditor.scss'

const fieldTarget = {
  drop () {
  },
}

class PageEditor extends Component {
  storeListener = null

  componentDidMount () {
    this.storeListener = store.addListener('change', this.update)
  }

  update = () => {
    this.forceUpdate()
  }

  change = () => {
    this.forceUpdate()
    store.update()
  }

  movePage = (id, atIndex) => {
    const { page, index } = this.findPage(id)
    store.list = update(store.list, {
      $splice: [
        [index, 1],
        [atIndex, 0, page],
      ],
    })
    store.updatePositions()
    this.forceUpdate()
  }

  findPage (id) {
    const page = _.find(store.list, { id })

    return {
      page,
      index: store.list.indexOf(page),
    }
  }

  componentWillUnmoun () {
    this.storeListener.remove()
  }

  render () {
    const { connectDropTarget } = this.props
    return connectDropTarget(
      <div className={styles.leftSide}>
        {store.list.map((model, i) => {
          if (model.removed) { return false }
          model.renderModules = _.includes([(store.current - 1), store.current, (store.current + 1)], i)
          return (
            <PageLabel
              key={model.id}
              movePage={this.movePage}
              findPage={this.findPage}
              page={model}
              number={i + 1}
              active={i === store.current ? styles.active : ''}
              onChange={this.change}
            />
          )
        })}
      </div>,
    )
  }
}

export default DropTarget('Page', fieldTarget, connect => ({
  connectDropTarget: connect.dropTarget(),
}))(PageEditor)
